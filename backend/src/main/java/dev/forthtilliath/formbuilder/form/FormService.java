package dev.forthtilliath.formbuilder.form;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.forthtilliath.formbuilder.common.FieldErrorsException;
import dev.forthtilliath.formbuilder.common.NotFoundException;
import dev.forthtilliath.formbuilder.common.Slugs;
import dev.forthtilliath.formbuilder.form.dto.FormDetail;
import dev.forthtilliath.formbuilder.form.dto.FormRequest;
import dev.forthtilliath.formbuilder.form.dto.FormSummary;
import dev.forthtilliath.formbuilder.form.field.CompositionChecker;
import dev.forthtilliath.formbuilder.submission.SubmissionRepository;

@Service
@Transactional
public class FormService {

	private final FormRepository forms;
	private final SubmissionRepository submissions;
	private final CompositionChecker compositionChecker;

	public FormService(FormRepository forms, SubmissionRepository submissions, CompositionChecker compositionChecker) {
		this.forms = forms;
		this.submissions = submissions;
		this.compositionChecker = compositionChecker;
	}

	@Transactional(readOnly = true)
	public List<FormSummary> list() {
		Map<UUID, Long> counts = submissions.countByForm();
		return forms.findAllByOrderByUpdatedAtDesc().stream()
				.map(form -> FormSummary.of(form, counts.getOrDefault(form.getId(), 0L)))
				.toList();
	}

	@Transactional(readOnly = true)
	public FormDetail get(UUID id) {
		return detail(find(id));
	}

	public FormDetail create(FormRequest request) {
		Form form = new Form(request.title(), Slugs.uniqueSlug(request.title()));
		apply(form, request);
		return detail(forms.save(form));
	}

	public FormDetail update(UUID id, FormRequest request) {
		Form form = find(id);
		apply(form, request);
		return detail(forms.saveAndFlush(form));
	}

	public FormDetail setStatus(UUID id, FormStatus status) {
		Form form = find(id);
		if (status == FormStatus.PUBLISHED && form.getFields().stream().noneMatch(f -> f.type().collectsValue())) {
			throw new FieldErrorsException("Impossible de publier une forme vide.",
					Map.of("fields", "Composez au moins un champ avant de publier."));
		}
		form.setStatus(status);
		return detail(forms.saveAndFlush(form));
	}

	public void delete(UUID id) {
		forms.delete(find(id));
	}

	public Form find(UUID id) {
		return forms.findById(id).orElseThrow(() -> new NotFoundException("Forme introuvable."));
	}

	private void apply(Form form, FormRequest request) {
		form.setTitle(request.title().strip());
		form.setDescription(request.description() == null ? null : request.description().strip());
		if (request.ink() != null) {
			form.setInk(request.ink());
		}
		if (request.fields() != null) {
			Map<String, String> errors = compositionChecker.check(request.fields());
			if (!errors.isEmpty()) {
				throw new FieldErrorsException("Composition incoherente.", errors);
			}
			form.setFields(request.fields());
		}
	}

	private FormDetail detail(Form form) {
		return FormDetail.of(form, submissions.countByFormId(form.getId()));
	}
}
