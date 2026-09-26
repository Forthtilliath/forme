import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { downloadCsv, toCsv } from '@forthtilliath/ts-kit';

import { collectsValue, type FormDetail, type SubmissionView } from '../../core/models';
import { Masthead } from '../../shared/masthead';
import { Stamp } from '../../shared/stamp';

import { formatValue } from './format-value';

/** Registre des tirages : les reponses d'une forme en tableau, exportables en CSV. */
@Component({
  selector: 'app-submissions-page',
  imports: [DatePipe, RouterLink, Masthead, Stamp],
  templateUrl: './submissions.page.html',
  styleUrl: './submissions.page.css',
})
export class SubmissionsPage {
  readonly id = input.required<string>();

  protected readonly form = httpResource<FormDetail>(() => `/api/forms/${this.id()}`);
  protected readonly submissions = httpResource<SubmissionView[]>(
    () => `/api/forms/${this.id()}/submissions`,
    {
      defaultValue: [],
    },
  );

  protected readonly columns = computed(() =>
    this.form.hasValue() ? this.form.value().fields.filter(collectsValue) : [],
  );

  protected readonly rows = computed(() =>
    this.submissions.value().map((s) => ({
      id: s.id,
      submittedAt: s.submittedAt,
      cells: this.columns().map((field) => formatValue(field, s.data[field.name])),
    })),
  );

  protected exportCsv(): void {
    const form = this.form.value();
    if (!form) return;
    const header = ['Reçu le', ...this.columns().map((f) => f.label)];
    const body = this.rows().map((r) => [
      new Date(r.submittedAt).toLocaleString('fr-FR'),
      ...r.cells,
    ]);
    // Point-virgule : separateur attendu par Excel en locale francaise
    downloadCsv(`${form.slug}-tirages.csv`, toCsv([header, ...body], ';'));
  }
}
