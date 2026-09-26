package dev.forthtilliath.formbuilder.common;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SlugsTest {

	@Test
	void stripsAccentsAndPunctuation() {
		assertThat(Slugs.slugify("  Commande d'affiches — Été 2026 !")).isEqualTo("commande-d-affiches-ete-2026");
	}

	@Test
	void fallsBackWhenNothingIsLeft() {
		assertThat(Slugs.slugify("¡¿…?!")).isEqualTo("forme");
	}

	@Test
	void appendsAShortRandomSuffix() {
		assertThat(Slugs.uniqueSlug("Avis de lecture")).matches("avis-de-lecture-[a-z2-9]{4}");
	}
}
