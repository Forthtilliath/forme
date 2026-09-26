package dev.forthtilliath.formbuilder.form.field;

import static dev.forthtilliath.formbuilder.Fixtures.choice;
import static dev.forthtilliath.formbuilder.Fixtures.field;
import static dev.forthtilliath.formbuilder.Fixtures.length;
import static dev.forthtilliath.formbuilder.Fixtures.pattern;
import static dev.forthtilliath.formbuilder.Fixtures.range;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

class CompositionCheckerTest {

	private final CompositionChecker checker = new CompositionChecker();

	@Test
	void acceptsACoherentComposition() {
		assertThat(checker.check(List.of(
				field(FieldType.TEXT, "nom", true, length(1, 10)),
				choice(FieldType.RADIO, "choix", true, "a", "b")))).isEmpty();
	}

	@Test
	void flagsDuplicateNamesButNotBetweenSections() {
		var errors = checker.check(List.of(
				field(FieldType.TEXT, "nom", true),
				new FieldDefinition("autre-id", FieldType.EMAIL, "nom", "Doublon", null, null, false, null, null, null),
				field(FieldType.SECTION, "titre", false),
				new FieldDefinition("autre-section", FieldType.SECTION, "titre", "T", null, null, false, null, null, null)));

		assertThat(errors).containsOnlyKeys("fields[1].name");
	}

	@Test
	void requiresUniqueOptionsForChoiceFields() {
		var errors = checker.check(List.of(
				choice(FieldType.SELECT, "vide", true),
				choice(FieldType.CHECKBOXES, "doublon", true, "a", "a")));

		assertThat(errors).containsOnlyKeys("fields[0].options", "fields[1].options");
	}

	@Test
	void checksBoundsOrderAndPatternSyntax() {
		var errors = checker.check(List.of(
				field(FieldType.TEXT, "a", false, length(10, 2)),
				field(FieldType.NUMBER, "b", false, range(5, 1)),
				field(FieldType.TEXT, "c", false, pattern("[a-", null))));

		assertThat(errors).containsOnlyKeys("fields[0].rules.maxLength", "fields[1].rules.max", "fields[2].rules.pattern");
	}
}
