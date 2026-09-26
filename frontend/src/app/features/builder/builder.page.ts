import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import type { OnInit } from '@angular/core';
import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { FormId } from '../../core/models';

import { ComposingStick } from './composing-stick/composing-stick';
import { Inspector } from './inspector/inspector';
import { TypeCase } from './type-case/type-case';
import { PlateView } from './views/plate-view';
import { ProofView } from './views/proof-view';
import { BuilderStore } from './builder.store';
import { BuilderBar, type BuilderView } from './builder-bar';
import { LineIndex } from './line-index';

/** L'atelier : casse | composteur (ou epreuve / plomb) | reglages. */
@Component({
  selector: 'app-builder-page',
  imports: [
    CdkDropListGroup,
    RouterLink,
    BuilderBar,
    TypeCase,
    LineIndex,
    ComposingStick,
    ProofView,
    PlateView,
    Inspector,
  ],
  providers: [BuilderStore],
  templateUrl: './builder.page.html',
  styleUrl: './builder.page.css',
  host: { '(document:keydown)': 'onKey($event)' },
})
export class BuilderPage implements OnInit {
  protected readonly store = inject(BuilderStore);

  /** Parametre de route :id (withComponentInputBinding). */
  readonly id = input.required<string>();
  protected readonly view = signal<BuilderView>('compose');

  ngOnInit(): void {
    this.store.load(this.id() as FormId);
  }

  protected onKey(event: KeyboardEvent): void {
    const mod = event.ctrlKey || event.metaKey;
    if (mod && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.store.saveNow();
      return;
    }
    if (isTyping(event.target)) return;

    const id = this.store.selectedId();
    if (event.key === 'Escape') {
      this.store.selectedId.set(null);
    } else if (!id) {
      return;
    } else if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      this.store.nudge(event.key === 'ArrowUp' ? -1 : 1);
    } else if (mod && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      this.store.duplicate(id);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.store.remove(id);
    }
  }
}

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}
