package dev.forthtilliath.formbuilder.common;

import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.persistence.AttributeConverter;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;

/**
 * Serialise un attribut JPA en texte JSON pour une colonne {@code jsonb}.
 * Passe par une String (et {@code stringtype=unspecified} cote JDBC) plutot que par
 * le FormatMapper d'Hibernate, pour ne dependre d'aucune integration Jackson d'Hibernate.
 */
public abstract class JsonColumnConverter<T> implements AttributeConverter<T, String> {

	private static final JsonMapper MAPPER = JsonMapper.builder()
			.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
			.changeDefaultPropertyInclusion(incl -> incl.withValueInclusion(JsonInclude.Include.NON_NULL))
			.build();

	private final TypeReference<T> type;

	protected JsonColumnConverter(TypeReference<T> type) {
		this.type = type;
	}

	@Override
	public String convertToDatabaseColumn(T attribute) {
		return attribute == null ? null : MAPPER.writeValueAsString(attribute);
	}

	@Override
	public T convertToEntityAttribute(String dbData) {
		return dbData == null ? null : MAPPER.readValue(dbData, type);
	}
}
