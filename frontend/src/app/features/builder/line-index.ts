import { Component, inject } from '@angular/core';

import { sortOf } from '../../core/field-catalog';

import { BuilderStore } from './builder.store';

/**
 * Table des lignes, a la place de la casse dans les vues Epreuve et Plomb :
 * on choisit une ligne, on la regle dans l'inspecteur, et l'apercu suit en direct.
 */
@Component({
  selector: 'app-line-index',
  template: `
    <nav class="index" aria-labelledby="index-title">
      <h2 id="index-title" class="index__title display">Lignes</h2>
      <p class="index__hint serif-italic">
        Choisissez une ligne pour la régler : l’aperçu suit en direct.
      </p>
      <ol class="index__list">
        @for (field of store.fields(); track field.id; let i = $index) {
          <li>
            <button
              type="button"
              class="index__item"
              [attr.aria-pressed]="store.selectedId() === field.id"
              (click)="store.selectedId.set(field.id)"
            >
              <span class="mono index__n">{{ i + 1 }}</span>
              <span class="index__glyph" aria-hidden="true">{{ glyph(field.type) }}</span>
              <span class="index__label">{{ field.label }}</span>
            </button>
          </li>
        }
      </ol>
    </nav>
  `,
  styles: `
    .index {
      display: grid;
      gap: 0.8rem;
    }
    .index__title {
      font-size: 2.2rem;
    }
    .index__hint {
      color: var(--ink-soft);
      font-size: 0.95rem;
    }
    .index__list {
      margin: 0;
      padding: 0;
      list-style: none;
      border-top: 1px solid var(--ink);
    }
    .index__item {
      display: grid;
      grid-template-columns: 1.6rem 2.3rem minmax(0, 1fr);
      align-items: baseline;
      width: 100%;
      padding: 0.45rem 0.2rem;
      border: 0;
      border-bottom: 1px solid var(--hairline);
      background: none;
      text-align: left;
    }
    .index__item:hover,
    .index__item[aria-pressed='true'] {
      background: var(--accent-wash);
    }
    .index__item[aria-pressed='true'] {
      box-shadow: inset 3px 0 0 var(--accent);
    }
    .index__n {
      color: var(--ink-faint);
      font-size: 0.62rem;
    }
    .index__glyph {
      color: var(--accent);
      font-family: var(--font-display);
      font-weight: 800;
    }
    .index__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
})
export class LineIndex {
  protected readonly store = inject(BuilderStore);
  protected glyph(type: Parameters<typeof sortOf>[0]): string {
    return sortOf(type).glyph;
  }
}
