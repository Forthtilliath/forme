package dev.forthtilliath.formbuilder.form.dto;

import java.util.List;

import dev.forthtilliath.formbuilder.form.FormInk;
import dev.forthtilliath.formbuilder.form.field.FieldDefinition;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Corps de creation / mise a jour d'une forme. Les champs absents gardent leur valeur actuelle. */
public record FormRequest(
		@NotBlank @Size(max = 160) String title,
		@Size(max = 600) String description,
		FormInk ink,
		@Size(max = 60) List<@Valid FieldDefinition> fields) {
}
