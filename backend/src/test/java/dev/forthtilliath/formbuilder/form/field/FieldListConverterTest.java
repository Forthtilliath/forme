package dev.forthtilliath.formbuilder.form.field;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

class FieldListConverterTest {

	private final FieldListConverter converter = new FieldListConverter();

	@Test
	void readsCompactJsonWithDefaults() {
		List<FieldDefinition> fields = converter.convertToEntityAttribute(
				"[{\"id\":\"a\",\"type\":\"rating\",\"name\":\"note\",\"label\":\"Note\",\"rules\":{\"max\":10},\"inconnu\":1}]");

		FieldDefinition field = fields.getFirst();
		assertThat(field.type()).isEqualTo(FieldType.RATING);
		assertThat(field.required()).isFalse();
		assertThat(field.rules().max()).isEqualByComparingTo(BigDecimal.TEN);
	}

	@Test
	void writesWithoutNullNoise() {
		String json = converter.convertToDatabaseColumn(List.of(
				new FieldDefinition("a", FieldType.TEXT, "nom", "Nom", null, null, true, FieldWidth.HALF, null, null)));

		assertThat(json).isEqualTo(
				"[{\"id\":\"a\",\"type\":\"text\",\"name\":\"nom\",\"label\":\"Nom\",\"required\":true,\"width\":\"half\"}]");
	}
}
