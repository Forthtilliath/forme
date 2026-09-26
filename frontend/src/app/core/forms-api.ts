import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type {
  ApiProblem,
  FormDetail,
  FormId,
  FormRequest,
  FormSummary,
  PublicForm,
  SubmissionValue,
  SubmissionView,
} from './models';

@Injectable({ providedIn: 'root' })
export class FormsApi {
  private readonly http = inject(HttpClient);

  list(): Observable<FormSummary[]> {
    return this.http.get<FormSummary[]>('/api/forms');
  }

  get(id: FormId): Observable<FormDetail> {
    return this.http.get<FormDetail>(`/api/forms/${id}`);
  }

  create(request: FormRequest): Observable<FormDetail> {
    return this.http.post<FormDetail>('/api/forms', request);
  }

  update(id: FormId, request: FormRequest): Observable<FormDetail> {
    return this.http.put<FormDetail>(`/api/forms/${id}`, request);
  }

  delete(id: FormId): Observable<unknown> {
    return this.http.delete(`/api/forms/${id}`);
  }

  setPublished(id: FormId, published: boolean): Observable<FormDetail> {
    return this.http.post<FormDetail>(
      `/api/forms/${id}/${published ? 'publish' : 'unpublish'}`,
      null,
    );
  }

  jsonSchema(id: FormId): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`/api/forms/${id}/json-schema`);
  }

  submissions(id: FormId): Observable<SubmissionView[]> {
    return this.http.get<SubmissionView[]>(`/api/forms/${id}/submissions`);
  }

  publicForm(slug: string): Observable<PublicForm> {
    return this.http.get<PublicForm>(`/api/public/forms/${slug}`);
  }

  submit(slug: string, data: Record<string, SubmissionValue | null>): Observable<SubmissionView> {
    return this.http.post<SubmissionView>(`/api/public/forms/${slug}/submissions`, data);
  }
}

/** Extrait le ProblemDetail d'une erreur HTTP, avec un message de repli lisible. */
export function toProblem(error: unknown): ApiProblem {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as Partial<ApiProblem> | null;
    if (error.status === 0) {
      return { status: 0, detail: "L'atelier est injoignable : le backend est-il démarré ?" };
    }
    return {
      status: error.status,
      detail: body?.detail ?? error.message,
      ...(body?.errors ? { errors: body.errors } : {}),
    };
  }
  return { status: -1, detail: 'Erreur inattendue.' };
}
