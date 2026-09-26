package dev.forthtilliath.formbuilder.form.field;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Justification du champ dans la grille : pleine ligne ou demi-ligne. */
public enum FieldWidth {
	@JsonProperty("full") FULL,
	@JsonProperty("half") HALF
}
