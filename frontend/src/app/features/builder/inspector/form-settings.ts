import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { INK_LABELS } from '../../../core/field-catalog';
import { INKS } from '../../../core/models';
import { BuilderStore } from '../builder.store';

/** Reglages de la forme entiere (aucun champ selectionne) + aide-memoire clavier. */
@Component({
  selector: 'app-form-settings',
  imports: [RouterLink],
  styleUrl: './inspector-fields.css',
  template: `
    @if (store.form(); as form) {
      <section class="panel">
        <header class="panel__head">
          <h2 class="panel__title display">La forme</h2>
          <span class="panel__kicker mono">Aucune ligne choisie</span>
        </header>

        <fieldset class="group">
          <legend>En-tête</legend>
          <label class="ctl">
            <span class="ctl__label">Titre</span>
            <input
              class="ctl__input"
              [value]="form.title"
              maxlength="160"
              (input)="setTitle($event)"
              [attr.aria-invalid]="!form.title.trim()"
            />
            @if (!form.title.trim()) {
              <span class="ctl__error"
                >Le titre est obligatoire : rien n'est enregistré sans lui.</span
              >
            }
          </label>
          <label class="ctl">
            <span class="ctl__label">Chapeau</span>
            <textarea
              class="ctl__input"
              [value]="form.description ?? ''"
              maxlength="600"
              (input)="setDescription($event)"
            ></textarea>
          </label>
        </fieldset>

        <fieldset class="group">
          <legend>Encre</legend>
          <div class="inks" role="radiogroup" aria-label="Couleur d'encre">
            @for (ink of inks; track ink) {
              <label class="ink" [attr.data-ink]="ink">
                <input
                  type="radio"
                  name="ink"
                  class="visually-hidden"
                  [checked]="form.ink === ink"
                  (change)="store.setMeta({ ink })"
                />
                <span class="ink__swatch" aria-hidden="true"></span>
                <span class="mono">{{ inkLabels[ink] }}</span>
              </label>
            }
          </div>
        </fieldset>

        <fieldset class="group">
          <legend>Adresse publique</legend>
          <code class="slug mono">/f/{{ form.slug }}</code>
          @if (form.status === 'published') {
            <a class="btn btn--sm" [routerLink]="['/f', form.slug]" target="_blank" rel="noopener"
              >Ouvrir la page ↗</a
            >
          } @else {
            <p class="ctl__hint">Accessible une fois le bon à tirer donné.</p>
          }
        </fieldset>

        <fieldset class="group">
          <legend>Raccourcis</legend>
          <dl class="keys">
            <dt><kbd>Alt</kbd> + <kbd>↑</kbd> <kbd>↓</kbd></dt>
            <dd>Déplacer la ligne</dd>
            <dt><kbd>Ctrl</kbd> + <kbd>D</kbd></dt>
            <dd>Dupliquer</dd>
            <dt><kbd>Suppr</kbd></dt>
            <dd>Retirer</dd>
            <dt><kbd>Échap</kbd></dt>
            <dd>Désélectionner</dd>
            <dt><kbd>Ctrl</kbd> + <kbd>S</kbd></dt>
            <dd>Enregistrer tout de suite</dd>
          </dl>
        </fieldset>
      </section>
    }
  `,
  styles: `
    .inks {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .ink {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem;
      border: 1.5px solid transparent;
      cursor: pointer;
    }
    .ink:has(input:checked) {
      border-color: var(--ink);
      background: var(--accent-wash);
    }
    .ink:has(input:focus-visible) {
      outline: 2px solid var(--accent);
    }
    .ink__swatch {
      width: 1.6rem;
      height: 1.6rem;
      border-radius: 50%;
      background: var(--accent);
      background-image: radial-gradient(
        circle at 30% 30%,
        rgb(255 255 255 / 0.35),
        transparent 40%
      );
    }
    .slug {
      overflow-wrap: anywhere;
      text-transform: none;
    }
    .keys {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.4rem 0.8rem;
      margin: 0;
      font-size: 0.88rem;
    }
    .keys dd {
      margin: 0;
      color: var(--ink-soft);
    }
    kbd {
      padding: 0.05rem 0.35rem;
      border: 1px solid var(--ink);
      border-bottom-width: 2px;
      border-radius: 2px;
      background: var(--sheet);
      font-family: var(--font-mono);
      font-size: 0.68rem;
    }
  `,
})
export class FormSettings {
  protected readonly store = inject(BuilderStore);
  protected readonly inks = INKS;
  protected readonly inkLabels = INK_LABELS;

  protected setTitle(event: Event): void {
    this.store.setMeta({ title: (event.target as HTMLInputElement).value });
  }

  protected setDescription(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.store.setMeta({ description: value.trim() ? value : undefined });
  }
}
