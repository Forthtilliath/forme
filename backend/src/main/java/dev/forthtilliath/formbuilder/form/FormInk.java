package dev.forthtilliath.formbuilder.form;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Encre d'impression de la forme : couleur d'accent de sa page publique. */
public enum FormInk {
	@JsonProperty("vermillon") VERMILLON,
	@JsonProperty("outremer") OUTREMER,
	@JsonProperty("sapin") SAPIN,
	@JsonProperty("prune") PRUNE
}
