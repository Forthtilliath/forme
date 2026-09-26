import { Component, computed, inject, input } from '@angular/core';

import type { FieldDefinition, FieldRules } from '../../../core/models';
import { BuilderStore } from '../builder.store';

type NumericRule = 'minLength' | 'maxLength' | 'min' | 'max';

/** Contraintes de validation, selon le type : longueurs, bornes, motif, note maximale. */
@Component({
  selector: 'app-rules-settings',
  styleUrl: './inspector-fields.css',
  template: `
    @let r = field().rules ?? {};
    @if (kind() !== 'none') {
      <fieldset class="group">
        <legend>Validation</legend>
        @switch (kind()) {
          @case ('text') {
            <div class="pair">
              <label class="ctl"
                ><span class="ctl__label">Min. caractères</span>
                <input
                  class="ctl__input"
                  type="number"
                  min="0"
                  [value]="r.minLength ?? ''"
                  (input)="num('minLength', $event)"
              /></label>
              <label class="ctl"
                ><span class="ctl__label">Max. caractères</span>
                <input
                  class="ctl__input"
                  type="number"
                  min="0"
                  [value]="r.maxLength ?? ''"
                  (input)="num('maxLength', $event)"
              /></label>
            </div>
            @if (field().type === 'text') {
              <label class="ctl"
                ><span class="ctl__label">Motif (regex)</span>
                <input
                  class="ctl__input ctl__input--mono"
                  [value]="r.pattern ?? ''"
                  placeholder="[A-Z]{2}-[0-9]{4}"
                  spellcheck="false"
                  (input)="str('pattern', $event)"
              /></label>
              @if (r.pattern) {
                <label class="ctl"
                  ><span class="ctl__label">Message si le motif échoue</span>
                  <input
                    class="ctl__input"
                    [value]="r.patternMessage ?? ''"
                    (input)="str('patternMessage', $event)"
                /></label>
              }
            }
          }
          @case ('email') {
            <label class="ctl"
              ><span class="ctl__label">Max. caractères</span>
              <input
                class="ctl__input"
                type="number"
                min="0"
                [value]="r.maxLength ?? ''"
                (input)="num('maxLength', $event)"
            /></label>
          }
          @case ('number') {
            <div class="pair">
              <label class="ctl"
                ><span class="ctl__label">Minimum</span>
                <input
                  class="ctl__input"
                  type="number"
                  [value]="r.min ?? ''"
                  (input)="num('min', $event)"
              /></label>
              <label class="ctl"
                ><span class="ctl__label">Maximum</span>
                <input
                  class="ctl__input"
                  type="number"
                  [value]="r.max ?? ''"
                  (input)="num('max', $event)"
              /></label>
            </div>
          }
          @case ('rating') {
            <label class="ctl"
              ><span class="ctl__label">Nombre d’étoiles : {{ r.max ?? 5 }}</span>
              <input
                type="range"
                min="3"
                max="10"
                [value]="r.max ?? 5"
                (input)="num('max', $event)"
            /></label>
          }
        }
      </fieldset>
    }
  `,
})
export class RulesSettings {
  private readonly store = inject(BuilderStore);
  readonly field = input.required<FieldDefinition>();

  protected readonly kind = computed(() => {
    const type = this.field().type;
    if (type === 'text' || type === 'textarea') return 'text';
    if (type === 'email' || type === 'number' || type === 'rating') return type;
    return 'none';
  });

  protected num(key: NumericRule, event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const value = raw === '' ? undefined : Number(raw);
    this.patch(key, value !== undefined && Number.isFinite(value) ? value : undefined);
  }

  protected str(key: 'pattern' | 'patternMessage', event: Event): void {
    this.patch(key, (event.target as HTMLInputElement).value || undefined);
  }

  /** Retire les cles vides : le JSON exporte ne garde que les regles reellement posees. */
  private patch<K extends keyof FieldRules>(key: K, value: FieldRules[K] | undefined): void {
    const merged: FieldRules = { ...this.field().rules, [key]: value };
    const rules = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== undefined),
    ) as FieldRules;
    this.store.update(this.field().id, { rules: Object.keys(rules).length ? rules : undefined });
  }
}
