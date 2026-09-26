package dev.forthtilliath.formbuilder.submission;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import dev.forthtilliath.formbuilder.form.field.FieldDefinition;
import dev.forthtilliath.formbuilder.form.field.FieldOption;
import dev.forthtilliath.formbuilder.form.field.FieldRules;

/**
 * Valide une reponse brute contre la composition d'une forme — la meme logique que les
 * validateurs Angular cote client, rejouee cote serveur car le client n'est jamais fiable.
 * Ne conserve que les cles connues : un champ ajoute a la main dans la requete est ignore.
 */
@Component
public class SubmissionValidator {

	static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

	public record Result(Map<String, Object> values, Map<String, String> errors) {
		public boolean isValid() {
			return errors.isEmpty();
		}
	}

	public Result validate(List<FieldDefinition> fields, Map<String, Object> raw) {
		Map<String, Object> values = new LinkedHashMap<>();
		Map<String, String> errors = new LinkedHashMap<>();

		for (FieldDefinition field : fields) {
			if (!field.type().collectsValue()) {
				continue;
			}
			Object value = normalize(raw.get(field.name()));
			if (isEmpty(value)) {
				if (field.required()) {
					errors.put(field.name(), switch (field.type()) {
						case CONSENT -> "Votre accord est requis.";
						case CHECKBOXES -> "Cochez au moins une case.";
						default -> "Ce champ est obligatoire.";
					});
				}
				continue;
			}
			String error = check(field, value);
			if (error != null) {
				errors.put(field.name(), error);
			} else {
				values.put(field.name(), value);
			}
		}
		return new Result(values, errors);
	}

	private String check(FieldDefinition field, Object value) {
		FieldRules rules = field.rulesOrEmpty();
		return switch (field.type()) {
			case TEXT, TEXTAREA -> value instanceof String s ? checkText(s, rules) : "Texte attendu.";
			case EMAIL -> !(value instanceof String s) || !EMAIL.matcher(s).matches()
					? "Adresse e-mail invalide." : checkLength(s, rules);
			case NUMBER -> checkNumber(value, rules);
			case DATE -> checkDate(value);
			case SELECT, RADIO -> value instanceof String s && optionValues(field).contains(s)
					? null : "Choix inconnu.";
			case CHECKBOXES -> value instanceof Collection<?> items && optionValues(field).containsAll(items)
					? null : "Choix inconnu.";
			case CONSENT -> Boolean.TRUE.equals(value) ? null : "Valeur invalide.";
			case RATING -> checkRating(value, rules.ratingMax());
			case SECTION -> null;
		};
	}

	private String checkText(String value, FieldRules rules) {
		String lengthError = checkLength(value, rules);
		if (lengthError != null) {
			return lengthError;
		}
		if (rules.pattern() != null && !rules.pattern().isBlank() && !value.matches(rules.pattern())) {
			return rules.patternMessage() != null ? rules.patternMessage() : "Format invalide.";
		}
		return null;
	}

	private String checkLength(String value, FieldRules rules) {
		if (rules.minLength() != null && value.length() < rules.minLength()) {
			return "Au moins " + rules.minLength() + " caracteres.";
		}
		if (rules.maxLength() != null && value.length() > rules.maxLength()) {
			return "Au plus " + rules.maxLength() + " caracteres.";
		}
		return null;
	}

	private String checkNumber(Object value, FieldRules rules) {
		BigDecimal number = toDecimal(value);
		if (number == null) {
			return "Nombre attendu.";
		}
		if (rules.min() != null && number.compareTo(rules.min()) < 0) {
			return "Minimum : " + rules.min().toPlainString() + ".";
		}
		if (rules.max() != null && number.compareTo(rules.max()) > 0) {
			return "Maximum : " + rules.max().toPlainString() + ".";
		}
		return null;
	}

	private String checkDate(Object value) {
		if (!(value instanceof String s)) {
			return "Date attendue.";
		}
		try {
			LocalDate.parse(s);
			return null;
		} catch (DateTimeParseException ex) {
			return "Date invalide (AAAA-MM-JJ).";
		}
	}

	private String checkRating(Object value, int max) {
		BigDecimal number = toDecimal(value);
		if (number == null || number.stripTrailingZeros().scale() > 0) {
			return "Note entiere attendue.";
		}
		int rating = number.intValue();
		return rating >= 1 && rating <= max ? null : "Note entre 1 et " + max + ".";
	}

	private static BigDecimal toDecimal(Object value) {
		if (value instanceof Number n) {
			return new BigDecimal(n.toString());
		}
		if (value instanceof String s) {
			try {
				return new BigDecimal(s.trim());
			} catch (NumberFormatException ex) {
				return null;
			}
		}
		return null;
	}

	private static Set<String> optionValues(FieldDefinition field) {
		return field.optionsOrEmpty().stream().map(FieldOption::value).collect(Collectors.toSet());
	}

	/** Chaines rognees, et « vide » unifie : null, "", [], false (consentement non coche). */
	private static Object normalize(Object value) {
		return value instanceof String s ? s.strip() : value;
	}

	private static boolean isEmpty(Object value) {
		return value == null
				|| (value instanceof String s && s.isEmpty())
				|| (value instanceof Collection<?> c && c.isEmpty())
				|| Boolean.FALSE.equals(value);
	}
}
