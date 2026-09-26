import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { buildFormGroup, isEmptyValue } from '../../core/field-validators';
import type { FieldDefinition, SubmissionValue } from '../../core/models';

import { FieldControl } from './field-control';

type Group = ReturnType<typeof buildFormGroup>;

/**
 * Rend une composition en formulaire remplissable. Sert a l'epreuve (apercu en direct
 * dans l'atelier) comme a la page publique : un seul rendu, donc aucun ecart possible.
 */
@Component({
  selector: 'app-printed-form',
  imports: [ReactiveFormsModule, FieldControl],
  template: `
    <form class="pf-grid" [formGroup]="group()" (ngSubmit)="submit()" novalidate>
      @for (field of fields(); track field.id) {
        @if (field.type === 'section') {
          <div class="pf-section">
            <h3 class="display">{{ field.label }}</h3>
          </div>
        } @else {
          <app-field-control
            [field]="field"
            [control]="group().controls[field.name]!"
            [idPrefix]="idPrefix()"
            [revealErrors]="attempted()"
            [serverError]="serverErrors()[field.name]"
          />
        }
      }
      <div class="pf-actions">
        <button type="submit" class="btn btn--ink" [disabled]="busy()">
          <span class="btn__glyph" aria-hidden="true">↧</span>
          {{ busy() ? 'Tirage en cours…' : submitLabel() }}
        </button>
        @if (attempted() && invalidCount() > 0) {
          <p class="mono pf-summary" role="status">{{ invalidCount() }} champ(s) à corriger</p>
        }
      </div>
    </form>
  `,
  styles: `
    .pf-actions {
      grid-column: span 2;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--hairline-strong);
    }
    .pf-summary {
      color: var(--danger);
    }
  `,
})
export class PrintedForm {
  readonly fields = input.required<FieldDefinition[]>();
  readonly serverErrors = input<Record<string, string>>({});
  readonly busy = input(false);
  readonly submitLabel = input('Envoyer');
  readonly idPrefix = input('pf');

  readonly submitted = output<Record<string, SubmissionValue>>();

  protected readonly attempted = signal(false);
  private readonly tick = signal(0);

  /** Recompose le FormGroup quand la composition change, en gardant les valeurs deja saisies. */
  protected readonly group = linkedSignal<FieldDefinition[], Group>({
    source: this.fields,
    computation: (fields, previous) => {
      const next = buildFormGroup(fields);
      for (const [name, control] of Object.entries(next.controls)) {
        const old = previous?.value.controls[name];
        if (old && !isEmptyValue(old.value)) control.setValue(old.value);
        if (old?.touched) control.markAsTouched();
      }
      return next;
    },
  });

  protected readonly invalidCount = computed(() => {
    this.tick();
    return Object.values(this.group().controls).filter((c) => c.invalid).length;
  });

  protected submit(): void {
    const group = this.group();
    group.markAllAsTouched();
    this.attempted.set(true);
    this.tick.update((t) => t + 1);
    if (group.invalid) return;

    const values: Record<string, SubmissionValue> = {};
    for (const [name, control] of Object.entries(group.controls)) {
      const raw = control.value;
      const value = typeof raw === 'string' ? raw.trim() : raw;
      if (value !== null && value !== undefined && !isEmptyValue(value)) values[name] = value;
    }
    this.submitted.emit(values);
  }

  /** Remet la feuille a blanc (apres un envoi reussi). */
  reset(): void {
    this.group().reset();
    this.attempted.set(false);
  }
}
