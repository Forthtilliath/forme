package dev.forthtilliath.formbuilder.schema;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import dev.forthtilliath.formbuilder.form.Form;
import dev.forthtilliath.formbuilder.form.field.FieldDefinition;
import dev.forthtilliath.formbuilder.form.field.FieldOption;
import dev.forthtilliath.formbuilder.form.field.FieldRules;

/**
 * Traduit une forme en JSON Schema (draft 2020-12) decrivant la reponse attendue :
 * utilisable tel quel pour valider les donnees ailleurs (autre backend, ajv, pipeline...).
 */
@Component
public class JsonSchemaExporter {

	public static final String DIALECT = "https://json-schema.org/draft/2020-12/schema";

	public Map<String, Object> export(Form form) {
		Map<String, Object> properties = new LinkedHashMap<>();
		List<String> required = new ArrayList<>();

		for (FieldDefinition field : form.getFields()) {
			if (!field.type().collectsValue()) {
				continue;
			}
			properties.put(field.name(), property(field));
			if (field.required()) {
				required.add(field.name());
			}
		}

		Map<String, Object> schema = new LinkedHashMap<>();
		schema.put("$schema", DIALECT);
		schema.put("$id", "urn:forme:" + form.getSlug());
		schema.put("title", form.getTitle());
		putIfPresent(schema, "description", form.getDescription());
		schema.put("type", "object");
		schema.put("properties", properties);
		if (!required.isEmpty()) {
			schema.put("required", required);
		}
		schema.put("additionalProperties", false);
		return schema;
	}

	private Map<String, Object> property(FieldDefinition field) {
		FieldRules rules = field.rulesOrEmpty();
		Map<String, Object> p = new LinkedHashMap<>();
		p.put("title", field.label());
		putIfPresent(p, "description", field.help());

		switch (field.type()) {
			case TEXT, TEXTAREA -> {
				p.put("type", "string");
				putIfPresent(p, "minLength", rules.minLength());
				putIfPresent(p, "maxLength", rules.maxLength());
				if (rules.pattern() != null && !rules.pattern().isBlank()) {
					p.put("pattern", "^(?:" + rules.pattern() + ")$");
				}
			}
			case EMAIL -> {
				p.put("type", "string");
				p.put("format", "email");
				putIfPresent(p, "maxLength", rules.maxLength());
			}
			case NUMBER -> {
				p.put("type", "number");
				putIfPresent(p, "minimum", rules.min());
				putIfPresent(p, "maximum", rules.max());
			}
			case DATE -> {
				p.put("type", "string");
				p.put("format", "date");
			}
			case SELECT, RADIO -> {
				p.put("type", "string");
				p.put("enum", optionValues(field));
			}
			case CHECKBOXES -> {
				p.put("type", "array");
				p.put("items", Map.of("type", "string", "enum", optionValues(field)));
				p.put("uniqueItems", true);
				if (field.required()) {
					p.put("minItems", 1);
				}
			}
			case CONSENT -> {
				p.put("type", "boolean");
				if (field.required()) {
					p.put("const", true);
				}
			}
			case RATING -> {
				p.put("type", "integer");
				p.put("minimum", 1);
				p.put("maximum", rules.ratingMax());
			}
			case SECTION -> throw new IllegalStateException("Un intertitre n'a pas de propriete.");
		}
		return p;
	}

	private static List<String> optionValues(FieldDefinition field) {
		return field.optionsOrEmpty().stream().map(FieldOption::value).toList();
	}

	private static void putIfPresent(Map<String, Object> target, String key, Object value) {
		if (value != null && !(value instanceof String s && s.isBlank())) {
			target.put(key, value);
		}
	}
}
