import { CdkDrag, CdkDragPlaceholder, CdkDragPreview, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, inject, signal } from '@angular/core';

import { type Sort, SORTS } from '../../../core/field-catalog';
import type { FieldType } from '../../../core/models';
import { BuilderStore } from '../builder.store';

const ROWS: { key: Sort['row']; title: string }[] = [
  { key: 'saisie', title: 'Haut de casse — saisie' },
  { key: 'choix', title: 'Bas de casse — choix' },
  { key: 'mise-en-page', title: 'Blancs & filets' },
];

/**
 * La casse : les caracteres disponibles. On les glisse dans le composteur (CDK drag-drop),
 * ou on clique dessus pour les inserer apres le champ selectionne (clavier, mobile).
 */
@Component({
  selector: 'app-type-case',
  imports: [CdkDropList, CdkDrag, CdkDragPreview, CdkDragPlaceholder],
  templateUrl: './type-case.html',
  styleUrl: './type-case.css',
})
export class TypeCase {
  private readonly store = inject(BuilderStore);

  protected readonly rows = ROWS.map((row) => ({
    ...row,
    sorts: SORTS.filter((s) => s.row === row.key),
  }));
  /** Caractere en cours de glisse : un fantome le remplace dans la casse pour qu'elle ne se creuse pas. */
  protected readonly dragging = signal<FieldType | null>(null);

  /** La casse ne recoit rien : on n'y range pas un champ deja compose. */
  protected readonly refuseDrop = (): boolean => false;

  protected add(type: FieldType): void {
    this.store.add(type);
  }
}
