package dev.forthtilliath.formbuilder.submission;

import java.util.Map;

import dev.forthtilliath.formbuilder.common.JsonColumnConverter;
import jakarta.persistence.Converter;
import tools.jackson.core.type.TypeReference;

@Converter
public class SubmissionDataConverter extends JsonColumnConverter<Map<String, Object>> {

	public SubmissionDataConverter() {
		super(new TypeReference<>() {
		});
	}
}
