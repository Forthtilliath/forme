package dev.forthtilliath.formbuilder.submission;

import java.util.UUID;

/** Projection JPQL : nombre de reponses par forme. */
public record FormSubmissionCount(UUID formId, long count) {
}
