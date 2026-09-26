import { Component, computed, input, signal, ViewEncapsulation } from '@angular/core';

import { downloadTextBlob } from '@forthtilliath/ts-kit';

import { highlightJson } from '../core/highlight-json';

/**
 * Bloc de code JSON facon plaque de plomb (encre claire sur metal sombre), avec copie et telechargement.
 * Encapsulation desactivee : les <span> injectes par [innerHTML] ne portent pas l'attribut de scope.
 */
@Component({
  selector: 'app-code-sheet',
  encapsulation: ViewEncapsulation.None,
  template: `
    <figure class="plate">
      <figcaption class="plate__bar mono">
        <span>{{ filename() }}</span>
        <span class="plate__tools">
          <button type="button" class="btn btn--sm" (click)="copy()">
            {{ copied() ? 'Copié ✓' : 'Copier' }}
          </button>
          <button type="button" class="btn btn--sm btn--ink" (click)="download()">
            ↧ Télécharger
          </button>
        </span>
      </figcaption>
      <pre class="plate__code" tabindex="0"><code [innerHTML]="html()"></code></pre>
    </figure>
  `,
  styles: `
    app-code-sheet {
      display: block;
      min-width: 0;
    }
    .plate {
      margin: 0;
      border: 2px solid var(--ink);
      background: #23211d;
      box-shadow: var(--press-lg);
    }
    .plate__bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.6rem;
      padding: 0.55rem 0.7rem;
      border-bottom: 2px solid var(--ink);
      background: var(--paper-deep);
      text-transform: none;
    }
    .plate__tools {
      display: flex;
      gap: 0.6rem;
    }
    .plate__code {
      max-height: 62vh;
      margin: 0;
      padding: 1rem 1.2rem;
      overflow: auto;
      color: #e9e1cf;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      line-height: 1.55;
      /* Reflets du metal */
      background-image: repeating-linear-gradient(
        90deg,
        rgb(255 255 255 / 0.018) 0 2px,
        transparent 2px 5px
      );
    }
    .plate__code :is(.j-key) {
      color: #f4a58a;
    }
    .plate__code :is(.j-str) {
      color: #c9d99a;
    }
    .plate__code :is(.j-num, .j-kw) {
      color: #9fb4ff;
    }
  `,
})
export class CodeSheet {
  readonly value = input.required<unknown>();
  readonly filename = input('forme.json');

  protected readonly json = computed(() => JSON.stringify(this.value(), null, 2));
  protected readonly html = computed(() => highlightJson(this.json()));
  protected readonly copied = signal(false);

  protected copy(): void {
    void navigator.clipboard.writeText(this.json()).then(() => {
      this.copied.set(true);
      setTimeout(() => {
        this.copied.set(false);
      }, 1600);
    });
  }

  protected download(): void {
    downloadTextBlob(this.filename(), this.json(), 'application/json');
  }
}
