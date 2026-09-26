package dev.forthtilliath.formbuilder.form;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import dev.forthtilliath.formbuilder.form.field.FieldDefinition;
import dev.forthtilliath.formbuilder.form.field.FieldListConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "forms")
public class Form {

	@Id
	private UUID id;

	@Column(nullable = false, length = 160)
	private String title;

	@Column(length = 600)
	private String description;

	@Column(nullable = false, unique = true, length = 200)
	private String slug;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private FormStatus status;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private FormInk ink;

	@Convert(converter = FieldListConverter.class)
	@Column(nullable = false, columnDefinition = "jsonb")
	private List<FieldDefinition> fields = new ArrayList<>();

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected Form() {
	}

	public Form(String title, String slug) {
		this.id = UUID.randomUUID();
		this.title = title;
		this.slug = slug;
		this.status = FormStatus.DRAFT;
		this.ink = FormInk.VERMILLON;
	}

	@PrePersist
	void onCreate() {
		createdAt = Instant.now();
		updatedAt = createdAt;
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getSlug() {
		return slug;
	}

	public FormStatus getStatus() {
		return status;
	}

	public void setStatus(FormStatus status) {
		this.status = status;
	}

	public FormInk getInk() {
		return ink;
	}

	public void setInk(FormInk ink) {
		this.ink = ink;
	}

	public List<FieldDefinition> getFields() {
		return fields;
	}

	public void setFields(List<FieldDefinition> fields) {
		this.fields = new ArrayList<>(fields);
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
