package dev.forthtilliath.formbuilder.form.field;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

import org.springframework.stereotype.Component;

/**
 * Coherence d'une composition au-dela des contraintes Bean Validation d'un champ isole :
 * noms uniques, options presentes, bornes dans le bon ordre, expression reguliere valide.
 * Les cles d'erreur suivent le chemin JSON ({@code fields[2].name}) pour que le front
 * puisse pointer le champ fautif dans le composteur.
 */
@Component
public class CompositionChecker {

	public Map<String, String> check(List<FieldDefinition> fields) {
		Map<String, String> errors = new LinkedHashMap<>();
		Set<String> ids = new HashSet<>();
		Set<String> names = new HashSet<>();

		for (int i = 0; i < fields.size(); i++) {
			FieldDefinition field = fields.get(i);
			String path = "fields[" + i + "]";

			if (!ids.add(field.id())) {
				errors.put(path + ".id", "Identifiant de champ en double.");
			}
			if (field.type().collectsValue() && !names.add(field.name())) {
				errors.put(path + ".name", "Le nom « " + field.name() + " » est deja utilise.");
			}
			checkOptions(field, path, errors);
			checkRules(field.rulesOrEmpty(), path, errors);
		}
		return errors;
	}

	private void checkOptions(FieldDefinition field, String path, Map<String, String> errors) {
		if (!field.type().hasOptions()) {
			return;
		}
		List<FieldOption> options = field.optionsOrEmpty();
		if (options.isEmpty()) {
			errors.put(path + ".options", "Ajoutez au moins un choix.");
			return;
		}
		Set<String> values = new HashSet<>();
		for (FieldOption option : options) {
			if (!values.add(option.value())) {
				errors.put(path + ".options", "La valeur « " + option.value() + " » est en double.");
				return;
			}
		}
	}

	private void checkRules(FieldRules rules, String path, Map<String, String> errors) {
		if (rules.minLength() != null && rules.maxLength() != null && rules.minLength() > rules.maxLength()) {
			errors.put(path + ".rules.maxLength", "La longueur maximale doit depasser la minimale.");
		}
		if (rules.min() != null && rules.max() != null && rules.min().compareTo(rules.max()) > 0) {
			errors.put(path + ".rules.max", "Le maximum doit etre superieur au minimum.");
		}
		if (rules.pattern() != null && !rules.pattern().isBlank()) {
			try {
				Pattern.compile(rules.pattern());
			} catch (PatternSyntaxException ex) {
				errors.put(path + ".rules.pattern", "Expression reguliere invalide.");
			}
		}
	}
}
