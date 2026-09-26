package dev.forthtilliath.formbuilder.common;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Rejet metier portant des erreurs par cle (nom de champ ou chemin) : reponse
 * submission invalide, ou composition de forme incoherente (noms de champs en double...).
 */
public class FieldErrorsException extends RuntimeException {

	private final transient Map<String, String> errors;

	public FieldErrorsException(String message, Map<String, String> errors) {
		super(message);
		// Ordre conserve (celui des champs de la forme) : le front affiche la premiere erreur en tete.
		this.errors = Collections.unmodifiableMap(new LinkedHashMap<>(errors));
	}

	public Map<String, String> getErrors() {
		return errors;
	}
}
