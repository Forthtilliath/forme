import { Component, inject } from '@angular/core';

import { BuilderStore } from '../builder.store';

import { FieldSettings } from './field-settings';
import { FormSettings } from './form-settings';

/** Colonne de droite : reglages du champ selectionne, sinon de la forme elle-meme. */
@Component({
  selector: 'app-inspector',
  imports: [FieldSettings, FormSettings],
  template: `
    <aside class="inspector" aria-label="Réglages">
      @if (store.selected(); as field) {
        <app-field-settings [field]="field" [index]="store.selectedIndex()" />
      } @else {
        <app-form-settings />
      }
    </aside>
  `,
  styles: `
    .inspector {
      display: grid;
      gap: 1.2rem;
      align-content: start;
    }
  `,
})
export class Inspector {
  protected readonly store = inject(BuilderStore);
}
