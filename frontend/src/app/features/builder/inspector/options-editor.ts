import { Component, inject, input } from '@angular/core';

import { swapItems } from '@forthtilliath/ts-kit';

import { toFieldName, uniqueName } from '../../../core/field-catalog';
import type { FieldDefinition, FieldOption } from '../../../core/models';
import { BuilderStore } from '../builder.store';

/** Liste des choix d'un select / radio / cases. La valeur suit le libelle tant qu'elle n'est pas retouchee. */
@Component({
  selector: 'app-options-editor',
  styleUrl: './inspector-fields.css',
  template: `
    <fieldset class="group">
      <legend>Choix</legend>
      <ol class="options">
        @for (
          option of field().options ?? [];
          track $index;
          let i = $index, first = $first, last = $last
        ) {
          <li class="option">
            <input
              class="ctl__input"
              [value]="option.label"
              aria-label="Libellé du choix"
              (input)="setLabel(i, $event)"
            />
            <input
              class="ctl__input ctl__input--mono"
              [value]="option.value"
              aria-label="Valeur du choix"
              spellcheck="false"
              (input)="setValue(i, $event)"
            />
            <span class="option__tools">
              <button
                type="button"
                class="btn btn--ghost btn--sm"
                [disabled]="first"
                (click)="move(i, -1)"
                aria-label="Monter"
              >
                ↑
              </button>
              <button
                type="button"
                class="btn btn--ghost btn--sm"
                [disabled]="last"
                (click)="move(i, 1)"
                aria-label="Descendre"
              >
                ↓
              </button>
              <button
                type="button"
                class="btn btn--ghost btn--sm"
                (click)="remove(i)"
                aria-label="Supprimer le choix"
              >
                ✕
              </button>
            </span>
          </li>
        }
      </ol>
      <button type="button" class="btn btn--sm" (click)="add()">+ Ajouter un choix</button>
    </fieldset>
  `,
  styles: `
    .options {
      display: grid;
      gap: 0.5rem;
      margin: 0;
      padding: 0;
      list-style: none;
      counter-reset: opt;
    }
    .option {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.3rem;
      padding-left: 1.4rem;
      position: relative;
    }
    .option::before {
      counter-increment: opt;
      content: counter(opt, lower-alpha) '.';
      position: absolute;
      left: 0;
      top: 0.5rem;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      color: var(--ink-faint);
    }
    .option__tools {
      grid-column: span 2;
      display: flex;
      justify-content: flex-end;
    }
  `,
})
export class OptionsEditor {
  private readonly store = inject(BuilderStore);
  readonly field = input.required<FieldDefinition>();

  private get options(): FieldOption[] {
    return this.field().options ?? [];
  }

  private commit(options: FieldOption[]): void {
    this.store.update(this.field().id, { options });
  }

  protected setLabel(index: number, event: Event): void {
    const label = (event.target as HTMLInputElement).value;
    this.commit(
      this.options.map((o, i) => {
        if (i !== index) return o;
        const follows = o.value === toFieldName(o.label) || o.value.startsWith('choix_');
        return { label, value: follows && label.trim() ? toFieldName(label) : o.value };
      }),
    );
  }

  protected setValue(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.commit(this.options.map((o, i) => (i === index ? { ...o, value } : o)));
  }

  protected move(index: number, delta: -1 | 1): void {
    this.commit(swapItems(this.options, index, index + delta));
  }

  protected remove(index: number): void {
    this.commit(this.options.filter((_, i) => i !== index));
  }

  protected add(): void {
    const taken = new Set(this.options.map((o) => o.value));
    const n = this.options.length + 1;
    this.commit([...this.options, { label: `Choix ${n}`, value: uniqueName(`choix_${n}`, taken) }]);
  }
}
