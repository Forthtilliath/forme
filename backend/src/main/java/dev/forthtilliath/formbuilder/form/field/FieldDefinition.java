package dev.forthtilliath.formbuilder.form.field;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Un champ compose dans une forme. Stocke tel quel (liste JSON) dans la colonne
 * {@code forms.fields} : c'est aussi le format exporte par le bouton « Plomb ».
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record FieldDefinition(
		@NotBlank @Size(max = 64) String id,
		@NotNull FieldType type,
		@NotBlank @Pattern(regexp = "[a-z][a-z0-9_]{0,63}", message = "doit etre en snake_case") String name,
		@NotBlank @Size(max = 200) String label,
		@Size(max = 200) String placeholder,
		@Size(max = 400) String help,
		Boolean required,
		FieldWidth width,
		@Valid FieldRules rules,
		List<@Valid FieldOption> options) {

	/** {@code required} absent du JSON = facultatif (Jackson 3 refuse null sur un boolean primitif). */
	public FieldDefinition {
		required = Boolean.TRUE.equals(required);
	}

	public FieldRules rulesOrEmpty() {
		return rules == null ? FieldRules.EMPTY : rules;
	}

	public List<FieldOption> optionsOrEmpty() {
		return options == null ? List.of() : options;
	}
}
