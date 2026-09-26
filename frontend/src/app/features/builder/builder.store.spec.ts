import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { FormsApi } from '../../core/forms-api';
import type { FormDetail, FormId, FormRequest } from '../../core/models';

import { BuilderStore } from './builder.store';

const FORM: FormDetail = {
  id: 'f1' as FormId,
  title: 'Avis',
  slug: 'avis-x2k4',
  status: 'draft',
  ink: 'vermillon',
  submissionCount: 0,
  createdAt: '2026-09-26T10:00:00Z',
  updatedAt: '2026-09-26T10:00:00Z',
  fields: [
    { id: 'a', type: 'text', name: 'prenom', label: 'Prénom', required: true },
    { id: 'b', type: 'email', name: 'email', label: 'E-mail', required: false },
  ],
};

describe('BuilderStore', () => {
  let store: BuilderStore;
  let updates: FormRequest[];

  beforeEach(() => {
    vi.useFakeTimers();
    updates = [];
    const api: Partial<FormsApi> = {
      get: () => of(structuredClone(FORM)),
      update: (_id, request) => {
        updates.push(request);
        return of({ ...FORM, updatedAt: '2026-09-26T10:05:00Z' });
      },
    };
    TestBed.configureTestingModule({
      providers: [BuilderStore, { provide: FormsApi, useValue: api }],
    });
    store = TestBed.inject(BuilderStore);
    store.load(FORM.id);
  });

  afterEach(() => vi.useRealTimers());

  it('inserts a new field after the selection and selects it', () => {
    store.selectedId.set('a');
    store.add('rating');
    expect(store.fields().map((f) => f.type)).toEqual(['text', 'rating', 'email']);
    expect(store.selected()?.type).toBe('rating');
  });

  it('keeps the technical name in sync with the label until it is customised', () => {
    store.update('a', { label: 'Prénom usuel' });
    expect(store.fields()[0]?.name).toBe('prenom_usuel');

    store.update('a', { name: 'first_name' });
    store.update('a', { label: 'Autre libellé' });
    expect(store.fields()[0]?.name).toBe('first_name');
  });

  it('nudges, duplicates and removes the selected line', () => {
    store.selectedId.set('b');
    store.nudge(-1);
    expect(store.fields().map((f) => f.id)).toEqual(['b', 'a']);

    store.duplicate('b');
    expect(store.fields()[1]?.name).toBe('email_copie');

    store.remove('a');
    expect(store.fields()).toHaveLength(2);
  });

  it('debounces saves and skips them while the composition is incoherent', () => {
    store.update('a', { label: 'Un' });
    store.update('a', { label: 'Deux' });
    vi.advanceTimersByTime(800);
    expect(updates).toHaveLength(1);
    expect(store.saveState()).toBe('saved');

    store.update('b', { name: 'deux' });
    vi.advanceTimersByTime(800);
    expect(store.issues().size).toBe(1);
    expect(updates).toHaveLength(1);
  });
});
