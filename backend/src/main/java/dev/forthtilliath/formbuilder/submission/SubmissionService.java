package dev.forthtilliath.formbuilder.submission;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.forthtilliath.formbuilder.common.FieldErrorsException;
import dev.forthtilliath.formbuilder.common.NotFoundException;
import dev.forthtilliath.formbuilder.form.Form;
import dev.forthtilliath.formbuilder.form.FormRepository;
import dev.forthtilliath.formbuilder.form.FormStatus;

@Service
@Transactional
public class SubmissionService {

	public record SubmissionView(UUID id, Map<String, Object> data, Instant submittedAt) {
		static SubmissionView of(Submission submission) {
			return new SubmissionView(submission.getId(), submission.getData(), submission.getSubmittedAt());
		}
	}

	private final FormRepository forms;
	private final SubmissionRepository submissions;
	private final SubmissionValidator validator;

	public SubmissionService(FormRepository forms, SubmissionRepository submissions, SubmissionValidator validator) {
		this.forms = forms;
		this.submissions = submissions;
		this.validator = validator;
	}

	public Form findPublished(String slug) {
		return forms.findBySlugAndStatus(slug, FormStatus.PUBLISHED)
				.orElseThrow(() -> new NotFoundException("Cette forme n'est pas (ou plus) publiee."));
	}

	public SubmissionView submit(String slug, Map<String, Object> raw) {
		Form form = findPublished(slug);
		SubmissionValidator.Result result = validator.validate(form.getFields(), raw);
		if (!result.isValid()) {
			throw new FieldErrorsException("Certaines reponses sont invalides.", result.errors());
		}
		return SubmissionView.of(submissions.save(new Submission(form.getId(), result.values())));
	}

	@Transactional(readOnly = true)
	public List<SubmissionView> list(UUID formId) {
		if (!forms.existsById(formId)) {
			throw new NotFoundException("Forme introuvable.");
		}
		return submissions.findAllByFormIdOrderBySubmittedAtDesc(formId).stream().map(SubmissionView::of).toList();
	}
}
