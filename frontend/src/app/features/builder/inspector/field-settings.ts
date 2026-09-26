import { Component, computed, inject, input } from '@angular/core';

import { sortOf } from '../../../core/field-catalog';
import { type FieldDefinition, type FieldWidth, hasOptions } from '../../../core/models';
import { BuilderStore } from '../builder.store';

import { OptionsEditor } from './options-editor';
import { RulesSettings } from './rules-settings';

const WITH_PLACEHOLDER = new Set(['text', 'textarea', 'email', 'number', 'select']);

@Component({
  selector: 'app-field-settings',
  imports: [OptionsEditor, RulesSettings],
  templateUrl: './field-settings.html',
  styleUrl: './inspector-fields.css',
})
export class FieldSettings {
  protected readonly store = inject(BuilderStore);

  readonly field = input.required<FieldDefinition>();
  readonly index = input(0);

  protected readonly sort = computed(() => sortOf(this.field().type));
  protected readonly isSection = computed(() => this.field().type === 'section');
  protected readonly hasOptions = computed(() => hasOptions(this.field().type));
  protected readonly hasPlaceholder = computed(() => WITH_PLACEHOLDER.has(this.field().type));
  protected readonly issue = computed(() => this.store.issues().get(this.field().id));
  protected readonly serverIssue = computed(() => {
    const prefix = `fields[${this.index()}]`;
    return Object.entries(this.store.serverErrors()).find(([key]) => key.startsWith(prefix))?.[1];
  });

  protected set(patch: Partial<FieldDefinition>): void {
    this.store.update(this.field().id, patch);
  }

  protected text(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  /**
   * Champ texte optionnel : une saisie vide retire la cle du JSON plutot que d'y laisser "".
   * Pas de trim ici : la valeur est re-liee a l'input, rogner a la frappe mangerait les espaces.
   */
  protected optional(event: Event): string | undefined {
    const value = this.text(event);
    return value.trim() ? value : undefined;
  }

  protected setWidth(width: FieldWidth): void {
    this.set({ width: width === 'full' ? undefined : width });
  }
}
