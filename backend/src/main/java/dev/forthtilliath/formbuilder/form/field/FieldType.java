package dev.forthtilliath.formbuilder.form.field;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Les « caracteres » de la casse : chaque type de champ composable dans une forme. */
public enum FieldType {
	@JsonProperty("text") TEXT,
	@JsonProperty("textarea") TEXTAREA,
	@JsonProperty("email") EMAIL,
	@JsonProperty("number") NUMBER,
	@JsonProperty("date") DATE,
	@JsonProperty("select") SELECT,
	@JsonProperty("radio") RADIO,
	@JsonProperty("checkboxes") CHECKBOXES,
	@JsonProperty("consent") CONSENT,
	@JsonProperty("rating") RATING,
	/** Intertitre de mise en page : ne collecte aucune valeur. */
	@JsonProperty("section") SECTION;

	public boolean collectsValue() {
		return this != SECTION;
	}

	public boolean hasOptions() {
		return this == SELECT || this == RADIO || this == CHECKBOXES;
	}
}
