import { randomId, slugify } from '@forthtilliath/ts-kit';

import type { FieldDefinition, FieldType, Ink } from './models';

/**
 * La casse : chaque type de champ est un « caractere » en plomb, avec son oeil (glyphe)
 * et son rang dans la casse (haut de casse = champs de saisie, bas de casse = choix).
 */
export interface Sort {
  type: FieldType;
  glyph: string;
  label: string;
  hint: string;
  row: 'saisie' | 'choix' | 'mise-en-page';
}

export const SORTS: readonly Sort[] = [
  { type: 'text', glyph: 'Aa', label: 'Texte court', hint: 'Une ligne', row: 'saisie' },
  { type: 'textarea', glyph: '¶', label: 'Paragraphe', hint: 'Plusieurs lignes', row: 'saisie' },
  { type: 'email', glyph: '@', label: 'E-mail', hint: 'Adresse vérifiée', row: 'saisie' },
  { type: 'number', glyph: '№', label: 'Nombre', hint: 'Bornes min / max', row: 'saisie' },
  { type: 'date', glyph: '31', label: 'Date', hint: 'Calendrier', row: 'saisie' },
  { type: 'select', glyph: '▾', label: 'Liste', hint: 'Un choix déroulant', row: 'choix' },
  { type: 'radio', glyph: '◉', label: 'Boutons', hint: 'Un choix visible', row: 'choix' },
  { type: 'checkboxes', glyph: '☑', label: 'Cases', hint: 'Plusieurs choix', row: 'choix' },
  { type: 'rating', glyph: '★', label: 'Note', hint: 'Étoiles', row: 'choix' },
  { type: 'consent', glyph: '✓', label: 'Accord', hint: 'Case à cocher seule', row: 'choix' },
  {
    type: 'section',
    glyph: '§',
    label: 'Intertitre',
    hint: 'Découpe la page',
    row: 'mise-en-page',
  },
];

export function sortOf(type: FieldType): Sort {
  const sort = SORTS.find((s) => s.type === type);
  if (!sort) throw new Error(`Type de champ inconnu : ${type}`);
  return sort;
}

export const INK_LABELS: Record<Ink, string> = {
  vermillon: 'Vermillon',
  outremer: 'Outremer',
  sapin: 'Vert sapin',
  prune: 'Prune',
};

/** snake_case compatible avec la contrainte Java `[a-z][a-z0-9_]*`. */
export function toFieldName(label: string): string {
  const base = slugify(label).replace(/-/g, '_').slice(0, 48);
  return /^[a-z]/.test(base) ? base : `champ_${base}`.replace(/_+$/, '');
}

/** Nom libre : suffixe _2, _3... si deja pris par un autre champ. */
export function uniqueName(wanted: string, taken: ReadonlySet<string>): string {
  if (!taken.has(wanted)) return wanted;
  let i = 2;
  while (taken.has(`${wanted}_${i}`)) i++;
  return `${wanted}_${i}`;
}

const DEFAULT_LABELS: Record<FieldType, string> = {
  text: 'Nouveau texte',
  textarea: 'Votre message',
  email: 'Adresse e-mail',
  number: 'Quantité',
  date: 'Date',
  select: 'Faites un choix',
  radio: 'Votre préférence',
  checkboxes: 'Cochez ce qui convient',
  consent: "J'accepte les conditions",
  rating: 'Votre note',
  section: 'Nouvel intertitre',
};

/** Fond un nouveau caractere : un champ pret a composer, avec des valeurs par defaut sensees. */
export function castField(type: FieldType, taken: ReadonlySet<string>): FieldDefinition {
  const label = DEFAULT_LABELS[type];
  const field: FieldDefinition = {
    id: randomId(),
    type,
    name: uniqueName(toFieldName(label), taken),
    label,
    required: false,
  };
  if (type === 'select' || type === 'radio' || type === 'checkboxes') {
    field.options = [
      { label: 'Premier choix', value: 'choix_1' },
      { label: 'Second choix', value: 'choix_2' },
    ];
  }
  if (type === 'rating') field.rules = { max: 5 };
  if (type === 'consent') field.required = true;
  return field;
}
