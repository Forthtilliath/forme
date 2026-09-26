package dev.forthtilliath.formbuilder.submission;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SubmissionRepository extends JpaRepository<Submission, UUID> {

	List<Submission> findAllByFormIdOrderBySubmittedAtDesc(UUID formId);

	long countByFormId(UUID formId);

	@Query("select new dev.forthtilliath.formbuilder.submission.FormSubmissionCount(s.formId, count(s))"
			+ " from Submission s group by s.formId")
	List<FormSubmissionCount> countGroupedByForm();

	default Map<UUID, Long> countByForm() {
		return countGroupedByForm().stream()
				.collect(Collectors.toMap(FormSubmissionCount::formId, FormSubmissionCount::count));
	}
}
