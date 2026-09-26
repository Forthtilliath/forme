import { Component, computed, input } from '@angular/core';
import type { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import type { FieldDefinition, SubmissionValue } from '../../core/models';

import { CheckboxGroup } from './checkbox-group';
import { RatingInput } from './rating-input';

/** Un champ tel qu'il est imprime pour la personne qui repond. */
@Component({
  selector: 'app-field-control',
  imports: [ReactiveFormsModule, CheckboxGroup, RatingInput],
  templateUrl: './field-control.html',
  host: { class: 'pf-field', '[class.pf-field--half]': "field().width === 'half'" },
})
export class FieldControl {
  readonly field = input.required<FieldDefinition>();
  readonly control = input.required<FormControl<SubmissionValue | null | undefined>>();
  /** Affiche les erreurs meme sur un champ non touche (apres une tentative d'envoi). */
  readonly revealErrors = input(false);
  readonly serverError = input<string>();
  /** Prefixe d'id : deux apercus de la meme forme peuvent coexister dans la page. */
  readonly idPrefix = input('pf');

  protected readonly inputId = computed(() => `${this.idPrefix()}-${this.field().name}`);
  protected readonly labelId = computed(() => `${this.inputId()}-label`);

  protected error(): string | null {
    const server = this.serverError();
    if (server) return server;
    const control = this.control();
    if (control.valid || !(control.touched || this.revealErrors())) return null;
    return (control.errors?.['field'] as string | undefined) ?? null;
  }
}
