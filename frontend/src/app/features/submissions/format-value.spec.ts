import type { FieldDefinition } from '../../core/models';

import { formatValue } from './format-value';

const options = [
  { label: 'Samedi matin', value: 'samedi_matin' },
  { label: 'Dimanche', value: 'dimanche' },
];
const field = (patch: Partial<FieldDefinition>): FieldDefinition => ({
  id: 'id',
  type: 'text',
  name: 'x',
  label: 'X',
  required: false,
  ...patch,
});

describe('formatValue', () => {
  it('shows option labels instead of raw values', () => {
    expect(formatValue(field({ type: 'radio', options }), 'dimanche')).toBe('Dimanche');
    expect(formatValue(field({ type: 'checkboxes', options }), ['samedi_matin', 'dimanche'])).toBe(
      'Samedi matin, Dimanche',
    );
  });

  it('formats ratings, consents and dates', () => {
    expect(formatValue(field({ type: 'rating', rules: { max: 10 } }), 7)).toBe('7 / 10');
    expect(formatValue(field({ type: 'consent' }), true)).toBe('Oui');
    expect(formatValue(field({ type: 'date' }), '2026-09-02')).toMatch(/2 sept\.? 2026/);
  });

  it('leaves missing answers blank', () => {
    expect(formatValue(field({}), undefined)).toBe('');
  });
});
