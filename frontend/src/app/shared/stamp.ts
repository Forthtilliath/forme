import { Component, computed, input } from '@angular/core';

import type { FormStatus } from '../core/models';

/** Tampon encreur de statut : « Bon à tirer » (publiée) ou « Épreuve » (brouillon). */
@Component({
  selector: 'app-stamp',
  template: `<span class="stamp" [class.stamp--draft]="!published()" [class.stamp--slam]="slam()">{{
    text()
  }}</span>`,
})
export class Stamp {
  readonly status = input<FormStatus>('draft');
  readonly label = input<string>();
  readonly slam = input(false);

  protected readonly published = computed(() => this.status() === 'published');
  protected readonly text = computed(
    () => this.label() ?? (this.published() ? 'Bon à tirer' : 'Épreuve'),
  );
}
