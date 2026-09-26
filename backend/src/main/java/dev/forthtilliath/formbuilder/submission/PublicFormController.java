package dev.forthtilliath.formbuilder.submission;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import dev.forthtilliath.formbuilder.form.Form;
import dev.forthtilliath.formbuilder.form.FormInk;
import dev.forthtilliath.formbuilder.form.field.FieldDefinition;

/** API publique : lire une forme publiee et y repondre, sans identifiant interne expose. */
@RestController
@RequestMapping("/api/public/forms/{slug}")
public class PublicFormController {

	public record PublicForm(String slug, String title, String description, FormInk ink, List<FieldDefinition> fields) {
		static PublicForm of(Form form) {
			return new PublicForm(form.getSlug(), form.getTitle(), form.getDescription(), form.getInk(), form.getFields());
		}
	}

	private final SubmissionService service;

	public PublicFormController(SubmissionService service) {
		this.service = service;
	}

	@GetMapping
	public PublicForm get(@PathVariable String slug) {
		return PublicForm.of(service.findPublished(slug));
	}

	@PostMapping("/submissions")
	@ResponseStatus(HttpStatus.CREATED)
	public SubmissionService.SubmissionView submit(@PathVariable String slug, @RequestBody Map<String, Object> body) {
		return service.submit(slug, body);
	}
}
