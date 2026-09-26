import type { FieldDefinition } from '../../core/models';

import { compositionIssues } from './composition-issues';

const field = (id: string, patch: Partial<FieldDefinition> = {}): FieldDefinition => ({
  id,
  type: 'text',
  name: id,
  label: id,
  required: false,
  ...patch,
});

describe('compositionIssues (miroir de CompositionChecker.java)', () => {
  it('accepts a coherent composition', () => {
    expect(compositionIssues([field('a'), field('b', { type: 'section', name: 'a' })]).size).toBe(
      0,
    );
  });

  it('flags the second field reusing a name', () => {
    const issues = compositionIssues([field('a', { name: 'x' }), field('b', { name: 'x' })]);
    expect([...issues.keys()]).toEqual(['b']);
  });

  it('rejects names the backend would refuse', () => {
    expect(compositionIssues([field('a', { name: 'Mon Champ' })]).get('a')).toMatch(/snake_case/);
  });

  it('checks choices, bounds and regex syntax', () => {
    const issues = compositionIssues([
      field('vide', { type: 'radio', options: [] }),
      field('doublon', {
        type: 'select',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'a' },
        ],
      }),
      field('bornes', { type: 'number', rules: { min: 5, max: 1 } }),
      field('regex', { rules: { pattern: '[a-' } }),
    ]);
    expect([...issues.keys()]).toEqual(['vide', 'doublon', 'bornes', 'regex']);
  });
});
