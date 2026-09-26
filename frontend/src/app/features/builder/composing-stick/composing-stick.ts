import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CdkDrag, CdkDragHandle, CdkDragPlaceholder, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';

import { sortOf } from '../../../core/field-catalog';
import type { FieldDefinition, FieldType } from '../../../core/models';
import { CropMarks } from '../../../shared/crop-marks';
import { BuilderStore } from '../builder.store';

/**
 * Le composteur : la feuille ou les champs sont alignes ligne a ligne.
 * Recoit les caracteres de la casse et permet de reordonner les lignes composees.
 */
@Component({
  selector: 'app-composing-stick',
  imports: [CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder, CropMarks],
  templateUrl: './composing-stick.html',
  styleUrl: './composing-stick.css',
})
export class ComposingStick {
  protected readonly store = inject(BuilderStore);
  protected readonly sortOf = sortOf;

  protected dropped(
    event: CdkDragDrop<FieldDefinition[], unknown, FieldType | FieldDefinition>,
  ): void {
    if (event.previousContainer === event.container) {
      if (event.previousIndex !== event.currentIndex)
        this.store.move(event.previousIndex, event.currentIndex);
    } else if (typeof event.item.data === 'string') {
      this.store.add(event.item.data, event.currentIndex);
    }
  }

  protected lineNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  protected summary(field: FieldDefinition): string {
    const parts: string[] = [];
    if (field.options?.length) parts.push(field.options.map((o) => o.label).join(' / '));
    const r = field.rules ?? {};
    if (r.minLength != null || r.maxLength != null)
      parts.push(`${r.minLength ?? 0}–${r.maxLength ?? '∞'} car.`);
    if (field.type === 'number' && (r.min != null || r.max != null))
      parts.push(`${r.min ?? '−∞'} à ${r.max ?? '+∞'}`);
    if (field.type === 'rating') parts.push(`sur ${r.max ?? 5}`);
    if (r.pattern) parts.push(`/${r.pattern}/`);
    return parts.join(' · ');
  }
}
