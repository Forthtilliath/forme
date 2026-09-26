package dev.forthtilliath.formbuilder.common;

import java.text.Normalizer;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;

/** Slugs d'URL publiques : « Avis de lecture » → {@code avis-de-lecture-k3f9}. */
public final class Slugs {

	private static final String ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
	private static final int MAX_BASE_LENGTH = 60;

	private Slugs() {
	}

	public static String slugify(String input) {
		String ascii = Normalizer.normalize(input == null ? "" : input, Normalizer.Form.NFKD)
				.replaceAll("\\p{M}", "");
		String slug = ascii.toLowerCase(Locale.ROOT)
				.replaceAll("[^a-z0-9]+", "-")
				.replaceAll("^-+|-+$", "");
		if (slug.length() > MAX_BASE_LENGTH) {
			slug = slug.substring(0, MAX_BASE_LENGTH).replaceAll("-+$", "");
		}
		return slug.isEmpty() ? "forme" : slug;
	}

	/** Slug suivi d'un suffixe aleatoire court, pour rester unique sans requete prealable. */
	public static String uniqueSlug(String title) {
		StringBuilder suffix = new StringBuilder(4);
		ThreadLocalRandom random = ThreadLocalRandom.current();
		for (int i = 0; i < 4; i++) {
			suffix.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
		}
		return slugify(title) + "-" + suffix;
	}
}
