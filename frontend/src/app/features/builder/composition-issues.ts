import { collectsValue, type FieldDefinition, hasOptions } from '../../core/models';

const NAME = /^[a-z][a-z0-9_]{0,63}$/;

/**
 * Problemes bloquants d'une composition, par id de champ. Miroir de CompositionChecker.java
 * (+ contraintes Bean Validation) : tant qu'il en reste, l'atelier n'envoie pas la sauvegarde.
 */
export function compositionIssues(fields: readonly FieldDefinition[]): Map<string, string> {
  const issues = new Map<string, string>();
  const seen = new Set<string>();

  for (const field of fields) {
    const flag = (message: string): void => {
      if (!issues.has(field.id)) issues.set(field.id, message);
    };
    const rules = field.rules ?? {};

    if (!field.label.trim()) flag('Le libellé est vide.');
    if (collectsValue(field)) {
      if (!NAME.test(field.name))
        flag('Nom technique invalide (snake_case, commence par une lettre).');
      else if (seen.has(field.name)) flag(`Le nom « ${field.name} » est déjà utilisé.`);
      seen.add(field.name);
    }
    if (hasOptions(field.type)) {
      const options = field.options ?? [];
      const values = options.map((o) => o.value.trim());
      if (options.length === 0) flag('Ajoutez au moins un choix.');
      else if (values.some((v) => !v) || options.some((o) => !o.label.trim()))
        flag('Un choix est incomplet.');
      else if (new Set(values).size !== values.length) flag('Deux choix ont la même valeur.');
    }
    if (rules.minLength != null && rules.maxLength != null && rules.minLength > rules.maxLength) {
      flag('La longueur maximale doit dépasser la minimale.');
    }
    if (
      field.type === 'number' &&
      rules.min != null &&
      rules.max != null &&
      rules.min > rules.max
    ) {
      flag('Le maximum doit être supérieur au minimum.');
    }
    if (rules.pattern) {
      try {
        new RegExp(rules.pattern);
      } catch {
        flag('Expression régulière invalide.');
      }
    }
  }
  return issues;
}
