import { castField, sortOf, SORTS, toFieldName, uniqueName } from './field-catalog';
import { FIELD_TYPES } from './models';

describe('field catalog', () => {
  it('has exactly one sort per field type', () => {
    expect(SORTS.map((s) => s.type).sort()).toEqual([...FIELD_TYPES].sort());
    expect(sortOf('rating').glyph).toBe('★');
  });

  it('derives snake_case names accepted by the Java constraint', () => {
    expect(toFieldName('Adresse e-mail')).toBe('adresse_e_mail');
    expect(toFieldName("Date d'arrivée")).toBe('date_d_arrivee');
    expect(toFieldName('2e prénom')).toBe('champ_2e_prenom');
    expect(toFieldName('!!!')).toBe('champ');
  });

  it('suffixes names already taken', () => {
    expect(uniqueName('nom', new Set(['nom', 'nom_2']))).toBe('nom_3');
    expect(uniqueName('email', new Set(['nom']))).toBe('email');
  });

  it('casts ready-to-use fields', () => {
    const select = castField('select', new Set());
    expect(select.options).toHaveLength(2);
    expect(castField('consent', new Set()).required).toBe(true);
    expect(castField('rating', new Set()).rules).toEqual({ max: 5 });
    expect(castField('text', new Set(['nouveau_texte'])).name).toBe('nouveau_texte_2');
  });
});
