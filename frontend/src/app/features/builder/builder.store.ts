import { moveItemInArray } from '@angular/cdk/drag-drop';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';

import { debounce, deepClone, randomId, swapItems } from '@forthtilliath/ts-kit';

import { castField, toFieldName, uniqueName } from '../../core/field-catalog';
import { FormsApi, toProblem } from '../../core/forms-api';
import type { FieldDefinition, FieldType, FormDetail, FormId } from '../../core/models';

import { compositionIssues } from './composition-issues';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type Meta = Pick<FormDetail, 'title' | 'description' | 'ink'>;

/**
 * Etat de l'atelier pour une forme : la composition en cours (signals), la selection,
 * et l'enregistrement automatique (debounce) vers l'API Spring.
 */
@Injectable()
export class BuilderStore {
  private readonly api = inject(FormsApi);

  readonly form = signal<FormDetail | null>(null);
  readonly fields = signal<FieldDefinition[]>([]);
  readonly selectedId = signal<string | null>(null);
  readonly saveState = signal<SaveState>('idle');
  readonly savedAt = signal<Date | null>(null);
  readonly serverErrors = signal<Record<string, string>>({});
  readonly loadError = signal<string | null>(null);
  readonly publishing = signal(false);

  readonly selected = computed(() => this.fields().find((f) => f.id === this.selectedId()) ?? null);
  readonly selectedIndex = computed(() =>
    this.fields().findIndex((f) => f.id === this.selectedId()),
  );
  /** Problemes de composition detectes cote client (memes regles que CompositionChecker.java). */
  readonly issues = computed(() => compositionIssues(this.fields()));

  private readonly scheduleSave = debounce(() => {
    this.save();
  }, 700);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.scheduleSave.flush();
    });
  }

  load(id: FormId): void {
    this.api.get(id).subscribe({
      next: (form) => {
        this.form.set(form);
        this.fields.set(form.fields);
        this.savedAt.set(new Date(form.updatedAt));
        this.saveState.set('saved');
      },
      error: (err: unknown) => {
        this.loadError.set(toProblem(err).detail ?? 'Forme introuvable.');
      },
    });
  }

  // ---------------------------------------------------------------- Composition

  add(type: FieldType, index = this.insertionIndex()): void {
    const field = castField(type, this.takenNames());
    this.mutate((fields) => [...fields.slice(0, index), field, ...fields.slice(index)]);
    this.selectedId.set(field.id);
  }

  move(from: number, to: number): void {
    this.mutate((fields) => {
      const next = [...fields];
      moveItemInArray(next, from, to);
      return next;
    });
  }

  /** Alt+fleche : echange le champ selectionne avec son voisin. */
  nudge(delta: -1 | 1): void {
    const i = this.selectedIndex();
    if (i < 0 || i + delta < 0 || i + delta >= this.fields().length) return;
    this.mutate((fields) => swapItems(fields, i, i + delta));
  }

  update(id: string, patch: Partial<FieldDefinition>): void {
    this.mutate((fields) =>
      fields.map((field) => {
        if (field.id !== id) return field;
        const next = { ...field, ...patch };
        // Le nom technique suit le libelle tant qu'il n'a pas ete personnalise
        if (
          patch.label !== undefined &&
          patch.name === undefined &&
          field.name === this.autoName(field)
        ) {
          next.name = uniqueName(toFieldName(patch.label), this.takenNames(id));
        }
        return next;
      }),
    );
  }

  duplicate(id: string): void {
    const index = this.fields().findIndex((f) => f.id === id);
    const source = this.fields()[index];
    if (!source) return;
    const copy: FieldDefinition = {
      ...deepClone(source),
      id: randomId(),
      name: uniqueName(`${source.name}_copie`, this.takenNames()),
      label: `${source.label} (copie)`,
    };
    this.mutate((fields) => [...fields.slice(0, index + 1), copy, ...fields.slice(index + 1)]);
    this.selectedId.set(copy.id);
  }

  remove(id: string): void {
    const index = this.fields().findIndex((f) => f.id === id);
    this.mutate((fields) => fields.filter((f) => f.id !== id));
    if (this.selectedId() === id) {
      const neighbour = this.fields()[Math.min(index, this.fields().length - 1)];
      this.selectedId.set(neighbour?.id ?? null);
    }
  }

  setMeta(patch: Partial<Meta>): void {
    this.form.update((form) => (form ? { ...form, ...patch } : form));
    this.saveState.set('idle');
    this.scheduleSave();
  }

  // ---------------------------------------------------------------- Presse

  togglePublished(): void {
    const form = this.form();
    if (!form) return;
    this.scheduleSave.flush();
    this.publishing.set(true);
    this.api.setPublished(form.id, form.status !== 'published').subscribe({
      next: (updated) => {
        this.form.set(updated);
        this.publishing.set(false);
        this.serverErrors.set({});
      },
      error: (err: unknown) => {
        this.publishing.set(false);
        const problem = toProblem(err);
        this.serverErrors.set(
          problem.errors ?? { form: problem.detail ?? 'Publication impossible.' },
        );
      },
    });
  }

  saveNow(): void {
    this.scheduleSave.flush();
  }

  private save(): void {
    const form = this.form();
    if (!form || this.issues().size > 0 || !form.title.trim()) return;
    this.saveState.set('saving');
    const { title, description, ink } = form;
    this.api
      .update(form.id, {
        title,
        ...(description ? { description } : {}),
        ink,
        fields: this.fields(),
      })
      .subscribe({
        next: (saved) => {
          // On garde la composition locale (l'utilisateur a pu continuer a taper) : seul le meta serveur change
          this.form.update((current) =>
            current ? { ...current, updatedAt: saved.updatedAt, slug: saved.slug } : current,
          );
          this.saveState.set('saved');
          this.savedAt.set(new Date(saved.updatedAt));
          this.serverErrors.set({});
        },
        error: (err: unknown) => {
          const problem = toProblem(err);
          this.saveState.set('error');
          this.serverErrors.set(
            problem.errors ?? { form: problem.detail ?? 'Enregistrement impossible.' },
          );
        },
      });
  }

  private mutate(recipe: (fields: FieldDefinition[]) => FieldDefinition[]): void {
    this.fields.update(recipe);
    this.saveState.set('idle');
    this.scheduleSave();
  }

  private insertionIndex(): number {
    const i = this.selectedIndex();
    return i < 0 ? this.fields().length : i + 1;
  }

  private takenNames(exceptId?: string): Set<string> {
    return new Set(
      this.fields()
        .filter((f) => f.id !== exceptId)
        .map((f) => f.name),
    );
  }

  private autoName(field: FieldDefinition): string {
    return uniqueName(toFieldName(field.label), this.takenNames(field.id));
  }
}
