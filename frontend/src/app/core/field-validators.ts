import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { FormControl, FormGroup } from '@angular/forms';

import { collectsValue, type FieldDefinition, type SubmissionValue } from './models';

/**
 * Miroir client de SubmissionValidator.java : memes regles, memes messages. Le serveur
 * reste l'autorite (il rejoue tout), mais l'utilisateur voit ses erreurs sans aller-retour.
 */

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Value = SubmissionValue | null | undefined;

export function isEmptyValue(value: Value): boolean {
  return (
    value === null ||
    value === undefined ||
    value === false ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0)
  );
}

function requiredMessage(field: FieldDefinition): string {
  if (field.type === 'consent') return 'Votre accord est requis.';
  if (field.type === 'checkboxes') return 'Cochez au moins une case.';
  return 'Ce champ est obligatoire.';
}

function lengthMessage(value: string, field: FieldDefinition): string | null {
  const { minLength, maxLength } = field.rules ?? {};
  if (minLength != null && value.length < minLength) return `Au moins ${minLength} caractères.`;
  if (maxLength != null && value.length > maxLength) return `Au plus ${maxLength} caractères.`;
  return null;
}

function patternMessage(value: string, field: FieldDefinition): string | null {
  const pattern = field.rules?.pattern;
  if (!pattern) return null;
  try {
    return new RegExp(`^(?:${pattern})$`).test(value)
      ? null
      : (field.rules?.patternMessage ?? 'Format invalide.');
  } catch {
    return null; // regex en cours d'edition dans l'inspecteur : pas de faux positif
  }
}

export function fieldError(field: FieldDefinition, raw: Value): string | null {
  const value = typeof raw === 'string' ? raw.trim() : raw;
  if (isEmptyValue(value)) return field.required ? requiredMessage(field) : null;

  const { min, max } = field.rules ?? {};
  switch (field.type) {
    case 'text':
    case 'textarea':
      return lengthMessage(String(value), field) ?? patternMessage(String(value), field);
    case 'email':
      return EMAIL.test(String(value))
        ? lengthMessage(String(value), field)
        : 'Adresse e-mail invalide.';
    case 'number': {
      const n = Number(value);
      if (Number.isNaN(n)) return 'Nombre attendu.';
      if (min != null && n < min) return `Minimum : ${min}.`;
      if (max != null && n > max) return `Maximum : ${max}.`;
      return null;
    }
    case 'date':
      return /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? null : 'Date invalide (AAAA-MM-JJ).';
    case 'rating': {
      const n = Number(value);
      const top = max ?? 5;
      return Number.isInteger(n) && n >= 1 && n <= top ? null : `Note entre 1 et ${top}.`;
    }
    default:
      return null;
  }
}

export function fieldValidator(field: FieldDefinition): ValidatorFn {
  return (control: AbstractControl<Value>): ValidationErrors | null => {
    const message = fieldError(field, control.value);
    return message ? { field: message } : null;
  };
}

function initialValue(field: FieldDefinition): Value {
  if (field.type === 'checkboxes') return [];
  if (field.type === 'consent') return false;
  return null;
}

/** Un FormGroup par forme : un controle par champ qui collecte une valeur. */
export function buildFormGroup(
  fields: readonly FieldDefinition[],
): FormGroup<Record<string, FormControl<Value>>> {
  const controls: Record<string, FormControl<Value>> = {};
  for (const field of fields.filter(collectsValue)) {
    // nonNullable : reset() revient a la valeur initiale ([] / false), pas a null
    controls[field.name] = new FormControl<Value>(initialValue(field), {
      nonNullable: true,
      validators: fieldValidator(field),
    });
  }
  return new FormGroup(controls);
}
