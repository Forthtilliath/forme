import { Component, computed, forwardRef, input, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

/** Note en etoiles : de vrais boutons radio (clavier, lecteurs d'ecran), habilles en fleurons. */
@Component({
  selector: 'app-rating-input',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RatingInput), multi: true },
  ],
  template: `
    <div class="rating" role="radiogroup" [attr.aria-labelledby]="labelledBy()">
      @for (n of steps(); track n) {
        <label
          class="rating__star"
          [class.rating__star--on]="n <= (hover() ?? value() ?? 0)"
          (mouseenter)="hover.set(n)"
          (mouseleave)="hover.set(null)"
        >
          <input
            type="radio"
            class="visually-hidden"
            [name]="name()"
            [value]="n"
            [checked]="value() === n"
            [disabled]="disabled()"
            (change)="select(n)"
            (blur)="onTouched()"
          />
          <span aria-hidden="true">★</span>
          <span class="visually-hidden">{{ n }} sur {{ max() }}</span>
        </label>
      }
      @if (value(); as v) {
        <span class="rating__count mono">{{ v }} / {{ max() }}</span>
      }
    </div>
  `,
  styles: `
    .rating {
      display: flex;
      align-items: center;
      gap: 0.15rem;
    }
    .rating__star {
      cursor: pointer;
      font-size: 1.9rem;
      line-height: 1;
      color: transparent;
      -webkit-text-stroke: 1.5px var(--ink);
      transition:
        transform 140ms var(--ease-slam),
        color 100ms;
    }
    .rating__star--on {
      color: var(--accent);
      -webkit-text-stroke-color: var(--ink);
    }
    .rating__star:hover {
      transform: rotate(-8deg) scale(1.12);
    }
    .rating__star:has(input:focus-visible) {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    .rating__count {
      margin-left: 0.6rem;
      color: var(--ink-soft);
    }
  `,
})
export class RatingInput implements ControlValueAccessor {
  readonly max = input(5);
  readonly name = input.required<string>();
  readonly labelledBy = input<string>();

  protected readonly value = signal<number | null>(null);
  protected readonly hover = signal<number | null>(null);
  protected readonly disabled = signal(false);
  protected readonly steps = computed(() => Array.from({ length: this.max() }, (_, i) => i + 1));

  private onChange: (value: number | null) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  protected select(n: number): void {
    this.value.set(n);
    this.onChange(n);
  }

  writeValue(value: number | null): void {
    this.value.set(value);
  }
  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
}
