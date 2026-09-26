import { Component, forwardRef, input, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import type { FieldOption } from '../../core/models';

/** Plusieurs cases -> une valeur string[] (ordre des options conserve). */
@Component({
  selector: 'app-checkbox-group',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxGroup), multi: true },
  ],
  template: `
    <div class="pf-choices">
      @for (option of options(); track option.value) {
        <label class="pf-choice">
          <input
            type="checkbox"
            [checked]="selected().includes(option.value)"
            [disabled]="disabled()"
            (change)="toggle(option.value)"
            (blur)="onTouched()"
          />
          {{ option.label }}
        </label>
      }
    </div>
  `,
})
export class CheckboxGroup implements ControlValueAccessor {
  readonly options = input.required<FieldOption[]>();

  protected readonly selected = signal<string[]>([]);
  protected readonly disabled = signal(false);

  private onChange: (value: string[]) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  protected toggle(value: string): void {
    const current = this.selected();
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    const ordered = this.options()
      .map((o) => o.value)
      .filter((v) => next.includes(v));
    this.selected.set(ordered);
    this.onChange(ordered);
    this.onTouched();
  }

  writeValue(value: string[] | null): void {
    this.selected.set(value ?? []);
  }
  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
}
