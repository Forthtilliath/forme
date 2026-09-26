package dev.forthtilliath.formbuilder.form.field;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Un choix propose par un champ select / radio / checkboxes. */
public record FieldOption(@NotBlank @Size(max = 120) String label, @NotBlank @Size(max = 120) String value) {
}
