import { Component, inject, signal } from '@angular/core';

import type { SubmissionValue } from '../../../core/models';
import { CodeSheet } from '../../../shared/code-sheet';
import { CropMarks } from '../../../shared/crop-marks';
import { PrintedForm } from '../../../shared/printed-form/printed-form';
import { BuilderStore } from '../builder.store';

/**
 * L'epreuve : la forme telle que la verront les repondants, en direct. On peut la remplir
 * pour tester les validations ; rien n'est envoye, on affiche seulement le JSON qui partirait.
 */
@Component({
  selector: 'app-proof-view',
  imports: [PrintedForm, CropMarks, CodeSheet],
  template: `
    @if (store.form(); as form) {
      <article class="proof sheet">
        <app-crop-marks />
        <p class="proof__kicker mono">Épreuve — rien n’est envoyé</p>
        <h2 class="proof__title display misregister">{{ form.title || 'Sans titre' }}</h2>
        @if (form.description) {
          <p class="proof__desc">{{ form.description }}</p>
        }
        <app-printed-form
          [fields]="store.fields()"
          idPrefix="proof"
          submitLabel="Tester l’envoi"
          (submitted)="payload.set($event)"
        />
      </article>

      @if (payload(); as data) {
        <section class="proof__result">
          <p class="mono">✓ Épreuve concluante — voici le corps que recevrait l’API&nbsp;:</p>
          <app-code-sheet [value]="data" filename="reponse-exemple.json" />
        </section>
      }
    }
  `,
  styles: `
    .proof {
      padding: clamp(1.4rem, 4vw, 3rem);
      border-top: 8px solid var(--accent);
    }
    .proof__kicker {
      color: var(--ink-faint);
      font-size: 0.62rem;
    }
    .proof__title {
      margin: 0.5rem 0 0.8rem;
      font-size: clamp(2.4rem, 5vw, 4rem);
    }
    .proof__desc {
      max-width: 38rem;
      margin-bottom: 2rem;
      color: var(--ink-soft);
      font-size: 1.15rem;
      font-style: italic;
    }
    .proof__result {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 0.8rem;
      margin-top: 2.5rem;
    }
  `,
})
export class ProofView {
  protected readonly store = inject(BuilderStore);
  protected readonly payload = signal<Record<string, SubmissionValue> | null>(null);
}
