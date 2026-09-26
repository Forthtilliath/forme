package dev.forthtilliath.formbuilder.submission;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Un « tirage » : une reponse validee a une forme publiee. */
@Entity
@Table(name = "submissions")
public class Submission {

	@Id
	private UUID id;

	@Column(name = "form_id", nullable = false)
	private UUID formId;

	@Convert(converter = SubmissionDataConverter.class)
	@Column(nullable = false, columnDefinition = "jsonb")
	private Map<String, Object> data;

	@Column(name = "submitted_at", nullable = false)
	private Instant submittedAt;

	protected Submission() {
	}

	public Submission(UUID formId, Map<String, Object> data) {
		this.id = UUID.randomUUID();
		this.formId = formId;
		this.data = new LinkedHashMap<>(data);
		this.submittedAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public UUID getFormId() {
		return formId;
	}

	public Map<String, Object> getData() {
		return data;
	}

	public Instant getSubmittedAt() {
		return submittedAt;
	}
}
