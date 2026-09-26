package dev.forthtilliath.formbuilder.form;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.forthtilliath.formbuilder.form.dto.FormDetail;
import dev.forthtilliath.formbuilder.form.dto.FormRequest;
import dev.forthtilliath.formbuilder.form.dto.FormSummary;
import dev.forthtilliath.formbuilder.schema.JsonSchemaExporter;
import dev.forthtilliath.formbuilder.submission.SubmissionService;
import dev.forthtilliath.formbuilder.submission.SubmissionService.SubmissionView;

/** API de l'atelier : composition, publication, export et lecture des reponses. */
@RestController
@RequestMapping("/api/forms")
public class FormController {

	private final FormService forms;
	private final SubmissionService submissions;
	private final JsonSchemaExporter schemaExporter;

	public FormController(FormService forms, SubmissionService submissions, JsonSchemaExporter schemaExporter) {
		this.forms = forms;
		this.submissions = submissions;
		this.schemaExporter = schemaExporter;
	}

	@GetMapping
	public List<FormSummary> list() {
		return forms.list();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public FormDetail create(@Validated @RequestBody FormRequest request) {
		return forms.create(request);
	}

	@GetMapping("/{id}")
	public FormDetail get(@PathVariable UUID id) {
		return forms.get(id);
	}

	@PutMapping("/{id}")
	public FormDetail update(@PathVariable UUID id, @Validated @RequestBody FormRequest request) {
		return forms.update(id, request);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable UUID id) {
		forms.delete(id);
	}

	@PostMapping("/{id}/publish")
	public FormDetail publish(@PathVariable UUID id) {
		return forms.setStatus(id, FormStatus.PUBLISHED);
	}

	@PostMapping("/{id}/unpublish")
	public FormDetail unpublish(@PathVariable UUID id) {
		return forms.setStatus(id, FormStatus.DRAFT);
	}

	@GetMapping("/{id}/json-schema")
	public Map<String, Object> jsonSchema(@PathVariable UUID id) {
		return schemaExporter.export(forms.find(id));
	}

	@GetMapping("/{id}/submissions")
	public List<SubmissionView> submissions(@PathVariable UUID id) {
		return submissions.list(id);
	}
}
