package dev.forthtilliath.formbuilder.form.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import dev.forthtilliath.formbuilder.form.Form;
import dev.forthtilliath.formbuilder.form.FormInk;
import dev.forthtilliath.formbuilder.form.FormStatus;
import dev.forthtilliath.formbuilder.form.field.FieldDefinition;

public record FormDetail(
		UUID id,
		String title,
		String description,
		String slug,
		FormStatus status,
		FormInk ink,
		List<FieldDefinition> fields,
		long submissionCount,
		Instant createdAt,
		Instant updatedAt) {

	public static FormDetail of(Form form, long submissionCount) {
		return new FormDetail(form.getId(), form.getTitle(), form.getDescription(), form.getSlug(),
				form.getStatus(), form.getInk(), form.getFields(), submissionCount,
				form.getCreatedAt(), form.getUpdatedAt());
	}
}
