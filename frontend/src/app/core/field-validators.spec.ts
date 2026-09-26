import { buildFormGroup, fieldError } from './field-validators';
import type { FieldDefinition } from './models';

const field = (patch: Partial<FieldDefinition>): FieldDefinition => ({
  id: 'id',
  type: 'text',
  name: 'champ',
  label: 'Champ',
  required: false,
  ...patch,
});

describe('fieldError (miroir de SubmissionValidator.java)', () => {
  it('uses type-specific messages for missing required values', () => {
    expect(fieldError(field({ required: true }), '   ')).toBe('Ce champ est obligatoire.');
    expect(fieldError(field({ type: 'consent', required: true }), false)).toBe(
      'Votre accord est requis.',
    );
    expect(fieldError(field({ type: 'checkboxes', required: true }), [])).toBe(
      'Cochez au moins une case.',
    );
  });

  it('ignores empty optional values', () => {
    expect(fieldError(field({ rules: { minLength: 5 } }), '')).toBeNull();
  });

  it('checks length then anchored pattern on trimmed text', () => {
    const code = field({
      rules: { pattern: '[A-Z]{2}-[0-9]{4}', patternMessage: 'Format AB-1234.' },
    });
    expect(fieldError(code, ' AB-1234 ')).toBeNull();
    expect(fieldError(code, 'xAB-1234')).toBe('Format AB-1234.');
    expect(fieldError(field({ rules: { maxLength: 3 } }), 'abcd')).toBe('Au plus 3 caractères.');
  });

  it('validates emails, number bounds, dates and ratings', () => {
    expect(fieldError(field({ type: 'email' }), 'pas-un-mail')).toBe('Adresse e-mail invalide.');
    expect(fieldError(field({ type: 'number', rules: { min: 1, max: 4 } }), 9)).toBe(
      'Maximum : 4.',
    );
    expect(fieldError(field({ type: 'date' }), '17/10/2026')).toBe('Date invalide (AAAA-MM-JJ).');
    expect(fieldError(field({ type: 'rating', rules: { max: 3 } }), 4)).toBe('Note entre 1 et 3.');
    expect(fieldError(field({ type: 'rating' }), 5)).toBeNull();
  });

  it('does not flag a regex that is still being typed in the inspector', () => {
    expect(fieldError(field({ rules: { pattern: '[a-' } }), 'abc')).toBeNull();
  });
});

describe('buildFormGroup', () => {
  it('creates one control per value-collecting field, with sensible initial values', () => {
    const group = buildFormGroup([
      field({ type: 'section', name: 'intro' }),
      field({ type: 'checkboxes', name: 'jours' }),
      field({ type: 'consent', name: 'rgpd' }),
    ]);
    expect(Object.keys(group.controls)).toEqual(['jours', 'rgpd']);
    expect(group.value).toEqual({ jours: [], rgpd: false });
  });

  it('resets to the initial value rather than null', () => {
    const group = buildFormGroup([field({ type: 'checkboxes', name: 'jours' })]);
    group.controls['jours']?.setValue(['lundi']);
    group.reset();
    expect(group.value).toEqual({ jours: [] });
  });
});
