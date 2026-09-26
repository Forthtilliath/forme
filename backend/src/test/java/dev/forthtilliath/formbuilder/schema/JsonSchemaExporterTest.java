package dev.forthtilliath.formbuilder.schema;

import static dev.forthtilliath.formbuilder.Fixtures.choice;
import static dev.forthtilliath.formbuilder.Fixtures.field;
import static dev.forthtilliath.formbuilder.Fixtures.length;
import static dev.forthtilliath.formbuilder.Fixtures.pattern;
import static dev.forthtilliath.formbuilder.Fixtures.range;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import dev.forthtilliath.formbuilder.form.Form;
import dev.forthtilliath.formbuilder.form.field.FieldType;

class JsonSchemaExporterTest {

	private final JsonSchemaExporter exporter = new JsonSchemaExporter();

	@SuppressWarnings("unchecked")
	private static Map<String, Object> prop(Map<String, Object> schema, String name) {
		return (Map<String, Object>) ((Map<String, Object>) schema.get("properties")).get(name);
	}

	@Test
	void describesTheExpectedAnswerObject() {
		Form form = new Form("Avis de lecture", "avis-de-lecture-x2k4");
		form.setFields(List.of(
				field(FieldType.SECTION, "intro", false),
				field(FieldType.TEXT, "livre", true, length(1, 120)),
				field(FieldType.EMAIL, "email", false),
				field(FieldType.RATING, "note", true, range(0, 10)),
				choice(FieldType.CHECKBOXES, "genres", true, "roman", "essai"),
				field(FieldType.CONSENT, "rgpd", true)));

		Map<String, Object> schema = exporter.export(form);

		assertThat(schema).containsEntry("$schema", JsonSchemaExporter.DIALECT)
				.containsEntry("$id", "urn:forme:avis-de-lecture-x2k4")
				.containsEntry("type", "object")
				.containsEntry("additionalProperties", false)
				.containsEntry("required", List.of("livre", "note", "genres", "rgpd"));
		assertThat((Map<String, Object>) schema.get("properties")).containsOnlyKeys("livre", "email", "note", "genres", "rgpd");

		assertThat(prop(schema, "livre")).containsEntry("type", "string").containsEntry("maxLength", 120);
		assertThat(prop(schema, "email")).containsEntry("format", "email");
		assertThat(prop(schema, "note")).containsEntry("type", "integer").containsEntry("maximum", 10);
		assertThat(prop(schema, "genres")).containsEntry("type", "array").containsEntry("minItems", 1);
		assertThat(prop(schema, "rgpd")).containsEntry("const", true);
	}

	@Test
	void anchorsPatternsLikeTheServerSideValidator() {
		Form form = new Form("Codes", "codes-abcd");
		form.setFields(List.of(field(FieldType.TEXT, "code", false, pattern("[A-Z]{2}", null))));

		assertThat(prop(exporter.export(form), "code")).containsEntry("pattern", "^(?:[A-Z]{2})$");
	}
}
