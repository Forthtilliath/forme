import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { sum } from '@forthtilliath/ts-kit';

import { FormsApi, toProblem } from '../../core/forms-api';
import type { FormSummary } from '../../core/models';
import { Masthead } from '../../shared/masthead';

import { FormCard } from './form-card';

@Component({
  selector: 'app-library-page',
  imports: [Masthead, FormCard],
  templateUrl: './library.page.html',
  styleUrl: './library.page.css',
})
export class LibraryPage {
  private readonly api = inject(FormsApi);
  private readonly router = inject(Router);

  protected readonly forms = httpResource<FormSummary[]>(() => '/api/forms', { defaultValue: [] });
  protected readonly creating = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly stats = computed(() => {
    const forms = this.forms.value();
    return {
      forms: forms.length,
      published: forms.filter((f) => f.status === 'published').length,
      submissions: sum(forms.map((f) => f.submissionCount)),
    };
  });

  protected create(): void {
    this.creating.set(true);
    this.api.create({ title: 'Forme sans titre' }).subscribe({
      next: (form) => void this.router.navigate(['/atelier', form.id]),
      error: (err: unknown) => {
        this.creating.set(false);
        this.error.set(toProblem(err).detail ?? null);
      },
    });
  }

  protected remove(form: FormSummary): void {
    this.api.delete(form.id).subscribe({
      next: () => this.forms.reload(),
      error: (err: unknown) => {
        this.error.set(toProblem(err).detail ?? null);
      },
    });
  }
}
