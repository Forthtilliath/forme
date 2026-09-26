package dev.forthtilliath.formbuilder.form.field;

import java.util.List;

import dev.forthtilliath.formbuilder.common.JsonColumnConverter;
import jakarta.persistence.Converter;
import tools.jackson.core.type.TypeReference;

@Converter
public class FieldListConverter extends JsonColumnConverter<List<FieldDefinition>> {

	public FieldListConverter() {
		super(new TypeReference<>() {
		});
	}
}
