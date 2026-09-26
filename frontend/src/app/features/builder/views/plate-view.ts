import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';

import { CodeSheet } from '../../../shared/code-sheet';
import { BuilderStore } from '../builder.store';

type Tab = 'definition' | 'schema';

/**
 * Le plomb : la forme exportee. Deux coulees — la definition native (live, cote client)
 * et le JSON Schema 2020-12 genere par JsonSchemaExporter.java (recharge a chaque sauvegarde).
 */
@Component({
  selector: 'app-plate-view',
  imports: [CodeSheet],
  template: `
    <section class="plate-view">
      <div class="tabs" role="tablist" aria-label="Format d'export">
        <button
          type="button"
          role="tab"
          class="tab"
          [attr.aria-selected]="tab() === 'definition'"
          (click)="tab.set('definition')"
        >
          <span class="display">Définition</span><span class="mono">format natif · live</span>
        </button>
        <button
          type="button"
          role="tab"
          class="tab"
          [attr.aria-selected]="tab() === 'schema'"
          (click)="tab.set('schema')"
        >
          <span class="display">JSON Schema</span
          ><span class="mono">draft 2020-12 · généré par Spring</span>
        </button>
      </div>

      @if (tab() === 'definition') {
        <p class="plate-view__note serif-italic">
          Ce que stocke la colonne <code>jsonb</code> de PostgreSQL : réimportable, versionnable,
          diffable.
        </p>
        <app-code-sheet [value]="definition()" [filename]="slug() + '.forme.json'" />
      } @else {
        <p class="plate-view__note serif-italic">
          Décrit la réponse attendue : validez-la ailleurs (ajv, un autre service…) avec les mêmes
          règles que l’atelier.
        </p>
        @if (schema.hasValue()) {
          <app-code-sheet [value]="schema.value()" [filename]="slug() + '.schema.json'" />
        } @else if (schema.error()) {
          <p class="mono plate-view__error">
            ✕ Schéma indisponible — la dernière sauvegarde a-t-elle réussi ?
          </p>
        } @else {
          <p class="mono">Coulée du plomb…</p>
        }
      }
    </section>
  `,
  styles: `
    .plate-view {
      display: grid;
      /* minmax(0, 1fr) : sans lui, la piste prend la largeur des plus longues lignes JSON */
      grid-template-columns: minmax(0, 1fr);
      gap: 1.2rem;
    }
    .tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 2px solid var(--ink);
    }
    .tab {
      display: grid;
      gap: 0.2rem;
      padding: 0.9rem 1rem;
      border: 0;
      background: var(--sheet);
      text-align: left;
    }
    .tab + .tab {
      border-left: 2px solid var(--ink);
    }
    .tab .display {
      font-size: 1.7rem;
    }
    .tab .mono {
      color: var(--ink-faint);
      font-size: 0.6rem;
    }
    .tab[aria-selected='true'] {
      background: var(--ink);
      color: var(--sheet);
    }
    .tab[aria-selected='true'] .display {
      color: var(--accent);
    }
    .plate-view__note code {
      font-family: var(--font-mono);
      font-size: 0.85em;
    }
    .plate-view__error {
      color: var(--danger);
    }
  `,
})
export class PlateView {
  private readonly store = inject(BuilderStore);

  protected readonly tab = signal<Tab>('definition');
  protected readonly slug = computed(() => this.store.form()?.slug ?? 'forme');

  protected readonly definition = computed(() => {
    const form = this.store.form();
    return {
      title: form?.title,
      description: form?.description,
      ink: form?.ink,
      fields: this.store.fields(),
    };
  });

  /** Le parametre v force un nouvel appel apres chaque sauvegarde (meme URL sinon). */
  protected readonly schema = httpResource<Record<string, unknown>>(() => {
    const form = this.store.form();
    const savedAt = this.store.savedAt();
    if (!form || this.tab() !== 'schema') return undefined;
    return { url: `/api/forms/${form.id}/json-schema`, params: { v: savedAt?.getTime() ?? 0 } };
  });
}
