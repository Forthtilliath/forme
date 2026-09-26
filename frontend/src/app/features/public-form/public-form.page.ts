import { httpResource } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { FormsApi, toProblem } from '../../core/forms-api';
import type { PublicForm, SubmissionValue, SubmissionView } from '../../core/models';
import { CropMarks } from '../../shared/crop-marks';
import { Logo } from '../../shared/logo';
import { PrintedForm } from '../../shared/printed-form/printed-form';
import { Stamp } from '../../shared/stamp';

/** Page publique /f/:slug — la forme imprimee, a remplir par n'importe qui. */
@Component({
  selector: 'app-public-form-page',
  imports: [PrintedForm, CropMarks, Logo, Stamp],
  templateUrl: './public-form.page.html',
  styleUrl: './public-form.page.css',
})
export class PublicFormPage {
  private readonly api = inject(FormsApi);
  private readonly title = inject(Title);

  readonly slug = input.required<string>();

  protected readonly form = httpResource<PublicForm>(() => `/api/public/forms/${this.slug()}`, {
    parse: (raw) => {
      const form = raw as PublicForm;
      this.title.setTitle(`${form.title} — Forme`);
      return form;
    },
  });

  protected readonly sending = signal(false);
  protected readonly serverErrors = signal<Record<string, string>>({});
  protected readonly failure = signal<string | null>(null);
  protected readonly receipt = signal<SubmissionView | null>(null);

  protected send(values: Record<string, SubmissionValue>): void {
    this.sending.set(true);
    this.failure.set(null);
    this.api.submit(this.slug(), values).subscribe({
      next: (receipt) => {
        this.sending.set(false);
        this.serverErrors.set({});
        this.receipt.set(receipt);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err: unknown) => {
        this.sending.set(false);
        const problem = toProblem(err);
        this.serverErrors.set(problem.errors ?? {});
        this.failure.set(problem.detail ?? 'Envoi impossible.');
      },
    });
  }

  protected again(): void {
    this.receipt.set(null);
  }

  protected folio(id: string): string {
    return id.slice(0, 4).toUpperCase();
  }
}
