package dev.forthtilliath.formbuilder.form.field;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Contraintes optionnelles d'un champ. {@code min}/{@code max} portent sur la valeur
 * (nombre) ou sur la note maximale (etoiles) ; {@code minLength}/{@code maxLength}
 * sur la longueur du texte.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record FieldRules(
		@PositiveOrZero Integer minLength,
		@PositiveOrZero Integer maxLength,
		BigDecimal min,
		BigDecimal max,
		@Size(max = 300) String pattern,
		@Size(max = 200) String patternMessage) {

	public static final FieldRules EMPTY = new FieldRules(null, null, null, null, null, null);

	public static final int DEFAULT_RATING_MAX = 5;

	public int ratingMax() {
		return max == null ? DEFAULT_RATING_MAX : max.intValue();
	}
}
