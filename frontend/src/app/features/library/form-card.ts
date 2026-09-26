import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { formatRelativeTime, pluralize } from '@forthtilliath/ts-kit';

import type { FormSummary } from '../../core/models';
import { CropMarks } from '../../shared/crop-marks';
import { Stamp } from '../../shared/stamp';

/** Une forme posee sur le marbre : feuille legerement de travers, tampon de statut. */
@Component({
  selector: 'app-form-card',
  imports: [RouterLink, CropMarks, Stamp],
  templateUrl: './form-card.html',
  styleUrl: './form-card.css',
  host: {
    '[attr.data-ink]': 'form().ink',
    '[style.--tilt]': 'tilt()',
  },
})
export class FormCard {
  readonly form = input.required<FormSummary>();
  readonly index = input(0);
  readonly deleted = output<FormSummary>();

  /** Inclinaison stable par forme (derivee de son id) : le marbre ne se reorganise pas a chaque visite. */
  protected readonly tilt = computed(() => {
    const id = this.form().id;
    let hash = 7;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
    return `${((Math.abs(hash) % 50) - 25) / 10}deg`;
  });

  protected readonly folio = computed(() => String(this.index() + 1).padStart(3, '0'));
  protected readonly updated = computed(() =>
    formatRelativeTime(new Date(this.form().updatedAt), new Date(), 'fr'),
  );
  protected readonly counts = computed(() => {
    const { fieldCount, submissionCount } = this.form();
    // En francais, zero prend le singulier (« 0 tirage ») : d'ou le `|| 1`.
    return `${fieldCount} ${pluralize(fieldCount || 1, 'champ')} · ${submissionCount} ${pluralize(submissionCount || 1, 'tirage')}`;
  });

  protected remove(): void {
    if (confirm(`Fondre « ${this.form().title} » ? Ses tirages seront perdus.`)) {
      this.deleted.emit(this.form());
    }
  }
}
