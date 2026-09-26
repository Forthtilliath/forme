package dev.forthtilliath.formbuilder.form;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FormRepository extends JpaRepository<Form, UUID> {

	List<Form> findAllByOrderByUpdatedAtDesc();

	Optional<Form> findBySlugAndStatus(String slug, FormStatus status);
}
