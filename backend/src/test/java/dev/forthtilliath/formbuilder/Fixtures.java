package dev.forthtilliath.formbuilder;

import java.math.BigDecimal;
import java.util.List;

import dev.forthtilliath.formbuilder.form.field.FieldDefinition;
import dev.forthtilliath.formbuilder.form.field.FieldOption;
import dev.forthtilliath.formbuilder.form.field.FieldRules;
import dev.forthtilliath.formbuilder.form.field.FieldType;

/** Fabriques de champs concises pour les tests. */
public final class Fixtures {

	private Fixtures() {
	}

	public static FieldDefinition field(FieldType type, String name, boolean required) {
		return field(type, name, required, null, null);
	}

	public static FieldDefinition field(FieldType type, String name, boolean required, FieldRules rules) {
		return field(type, name, required, rules, null);
	}

	public static FieldDefinition field(FieldType type, String name, boolean required, FieldRules rules,
			List<FieldOption> options) {
		return new FieldDefinition("id-" + name, type, name, "Libelle " + name, null, null, required, null, rules,
				options);
	}

	public static FieldDefinition choice(FieldType type, String name, boolean required, String... values) {
		List<FieldOption> options = java.util.Arrays.stream(values).map(v -> new FieldOption(v.toUpperCase(), v)).toList();
		return field(type, name, required, null, options);
	}

	public static FieldRules length(Integer min, Integer max) {
		return new FieldRules(min, max, null, null, null, null);
	}

	public static FieldRules range(long min, long max) {
		return new FieldRules(null, null, BigDecimal.valueOf(min), BigDecimal.valueOf(max), null, null);
	}

	public static FieldRules pattern(String regex, String message) {
		return new FieldRules(null, null, null, null, regex, message);
	}
}
