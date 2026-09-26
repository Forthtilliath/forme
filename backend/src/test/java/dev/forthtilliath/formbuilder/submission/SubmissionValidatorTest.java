package dev.forthtilliath.formbuilder.submission;

import static dev.forthtilliath.formbuilder.Fixtures.choice;
import static dev.forthtilliath.formbuilder.Fixtures.field;
import static dev.forthtilliath.formbuilder.Fixtures.length;
import static dev.forthtilliath.formbuilder.Fixtures.pattern;
import static dev.forthtilliath.formbuilder.Fixtures.range;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import dev.forthtilliath.formbuilder.form.field.FieldDefinition;
import dev.forthtilliath.formbuilder.form.field.FieldType;

class SubmissionValidatorTest {

	private final SubmissionValidator validator = new SubmissionValidator();

	private SubmissionValidator.Result validate(List<FieldDefinition> fields, Map<String, Object> data) {
		return validator.validate(fields, data);
	}

	@Test
	void reportsMissingRequiredFieldsWithTypeSpecificMessages() {
		var result = validate(List.of(
				field(FieldType.TEXT, "nom", true),
				field(FieldType.CONSENT, "rgpd", true),
				choice(FieldType.CHECKBOXES, "jours", true, "lundi", "mardi")),
				Map.of("nom", "   ", "rgpd", false, "jours", List.of()));

		assertThat(result.errors()).containsOnlyKeys("nom", "rgpd", "jours");
		assertThat(result.errors().get("rgpd")).isEqualTo("Votre accord est requis.");
		assertThat(result.errors().get("jours")).isEqualTo("Cochez au moins une case.");
	}

	@Test
	void ignoresEmptyOptionalFieldsAndStripsUnknownKeys() {
		var result = validate(List.of(field(FieldType.TEXT, "surnom", false)),
				Map.of("surnom", "", "pirate", "DROP TABLE"));

		assertThat(result.isValid()).isTrue();
		assertThat(result.values()).isEmpty();
	}

	@Test
	void trimsTextAndChecksLengthAndPattern() {
		var fields = List.of(
				field(FieldType.TEXT, "code", true, pattern("[A-Z]{2}-[0-9]{4}", "Format AB-1234.")),
				field(FieldType.TEXTAREA, "avis", true, length(5, 10)));

		var ok = validate(fields, Map.of("code", "  AB-1234 ", "avis", "Superbe"));
		assertThat(ok.isValid()).isTrue();
		assertThat(ok.values()).containsEntry("code", "AB-1234");

		var ko = validate(fields, Map.of("code", "ab-12", "avis", "Bof"));
		assertThat(ko.errors()).containsEntry("code", "Format AB-1234.").containsEntry("avis", "Au moins 5 caracteres.");
	}

	@Test
	void validatesEmailNumbersAndDates() {
		var fields = List.of(
				field(FieldType.EMAIL, "email", true),
				field(FieldType.NUMBER, "places", true, range(1, 4)),
				field(FieldType.DATE, "jour", true));

		assertThat(validate(fields, Map.of("email", "a@b.fr", "places", 2, "jour", "2026-10-17")).isValid()).isTrue();
		assertThat(validate(fields, Map.of("email", "a@b.fr", "places", "3", "jour", "2026-10-17")).isValid()).isTrue();

		var ko = validate(fields, Map.of("email", "pas-un-mail", "places", 9, "jour", "17/10/2026"));
		assertThat(ko.errors()).containsOnlyKeys("email", "places", "jour");
		assertThat(ko.errors().get("places")).isEqualTo("Maximum : 4.");
	}

	@Test
	void restrictsChoicesToDeclaredOptions() {
		var fields = List.of(
				choice(FieldType.SELECT, "format", true, "a3", "a2"),
				choice(FieldType.CHECKBOXES, "jours", false, "lundi", "mardi"));

		assertThat(validate(fields, Map.of("format", "a3", "jours", List.of("mardi"))).isValid()).isTrue();

		var ko = validate(fields, Map.of("format", "a0", "jours", List.of("lundi", "dimanche")));
		assertThat(ko.errors()).containsOnlyKeys("format", "jours");
	}

	@Test
	void ratingMustBeAnIntegerWithinBounds() {
		var fields = List.of(field(FieldType.RATING, "note", true, range(0, 3)));

		assertThat(validate(fields, Map.of("note", 3)).isValid()).isTrue();
		assertThat(validate(fields, Map.of("note", 4)).errors()).containsEntry("note", "Note entre 1 et 3.");
		assertThat(validate(fields, Map.of("note", 2.5)).errors()).containsEntry("note", "Note entiere attendue.");
	}

	@Test
	void sectionsNeverCollectValues() {
		Map<String, Object> data = new HashMap<>();
		data.put("intro", "texte");
		var result = validate(List.of(field(FieldType.SECTION, "intro", true)), data);

		assertThat(result.isValid()).isTrue();
		assertThat(result.values()).isEmpty();
	}
}
