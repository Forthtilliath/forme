import type { FieldDefinition, SubmissionValue } from '../../core/models';

const DATE = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

/** Valeur brute d'une reponse -> texte lisible (libelles des choix, dates, notes). */
export function formatValue(field: FieldDefinition, value: SubmissionValue | undefined): string {
  if (value === undefined || value === '') return '';
  const label = (v: string): string => field.options?.find((o) => o.value === v)?.label ?? v;

  switch (field.type) {
    case 'select':
    case 'radio':
      return label(String(value));
    case 'checkboxes':
      return Array.isArray(value) ? value.map(label).join(', ') : label(String(value));
    case 'consent':
      return value === true ? 'Oui' : 'Non';
    case 'rating':
      return `${String(value)} / ${field.rules?.max ?? 5}`;
    case 'date': {
      const date = new Date(`${String(value)}T00:00:00`);
      return Number.isNaN(date.getTime()) ? String(value) : DATE.format(date);
    }
    default:
      return Array.isArray(value) ? value.join(', ') : String(value);
  }
}
