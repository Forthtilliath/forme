package dev.forthtilliath.formbuilder.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum FormStatus {
	/** En cours de composition : invisible publiquement. */
	@JsonProperty("draft") DRAFT,
	/** « Bon a tirer » : accessible sur /f/{slug} et accepte des reponses. */
	@JsonProperty("published") PUBLISHED
}
