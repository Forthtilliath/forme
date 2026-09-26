package dev.forthtilliath.formbuilder.form.dto;

import java.time.Instant;
import java.util.UUID;

import dev.forthtilliath.formbuilder.form.Form;
import dev.forthtilliath.formbuilder.form.FormInk;
import dev.forthtilliath.formbuilder.form.FormStatus;

public record FormSummary(
		UUID id,
		String title,
		String description,
		String slug,
		FormStatus status,
		FormInk ink,
		int fieldCount,
		long submissionCount,
		Instant updatedAt) {

	public static FormSummary of(Form form, long submissionCount) {
		int fieldCount = (int) form.getFields().stream().filter(f -> f.type().collectsValue()).count();
		return new FormSummary(form.getId(), form.getTitle(), form.getDescription(), form.getSlug(),
				form.getStatus(), form.getInk(), fieldCount, submissionCount, form.getUpdatedAt());
	}
}
