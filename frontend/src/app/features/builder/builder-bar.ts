import { DatePipe } from '@angular/common';
import { Component, computed, inject, model } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Logo } from '../../shared/logo';
import { Stamp } from '../../shared/stamp';

import { BuilderStore } from './builder.store';

export type BuilderView = 'compose' | 'proof' | 'plate';

const VIEWS: { key: BuilderView; label: string; glyph: string }[] = [
  { key: 'compose', label: 'Composer', glyph: '⠿' },
  { key: 'proof', label: 'Épreuve', glyph: '◐' },
  { key: 'plate', label: 'Plomb', glyph: '{ }' },
];

@Component({
  selector: 'app-builder-bar',
  imports: [DatePipe, RouterLink, Logo, Stamp],
  templateUrl: './builder-bar.html',
  styleUrl: './builder-bar.css',
})
export class BuilderBar {
  protected readonly store = inject(BuilderStore);
  readonly view = model.required<BuilderView>();
  protected readonly views = VIEWS;

  protected readonly published = computed(() => this.store.form()?.status === 'published');
  protected readonly publishError = computed(() => {
    const errors = this.store.serverErrors();
    return errors['fields'] ?? errors['form'];
  });

  protected readonly saveLabel = computed(() => {
    const issues = this.store.issues().size;
    if (issues > 0) return `⚠ ${issues} ligne(s) à corriger — rien n'est enregistré`;
    if (!this.store.form()?.title.trim()) return '⚠ Titre manquant — rien n’est enregistré';
    switch (this.store.saveState()) {
      case 'saving':
        return '● Sous presse…';
      case 'error':
        return '✕ Échec de l’enregistrement';
      case 'idle':
        return '○ Encre fraîche…';
      case 'saved':
        return null;
    }
  });
}
