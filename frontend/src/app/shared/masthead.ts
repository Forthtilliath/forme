import { Component } from '@angular/core';

import { Logo } from './logo';

/** Bandeau de titre facon achevé d'imprimer : logo, filets, mentions techniques. */
@Component({
  selector: 'app-masthead',
  imports: [Logo],
  template: `
    <header class="masthead">
      <div class="masthead__top">
        <app-logo />
        <p class="masthead__tagline serif-italic">Atelier de composition de formulaires</p>
        <ng-content />
      </div>
      <hr class="rule rule--double" />
      <p class="masthead__imprint mono">
        <span>Angular 22 × Spring Boot 4</span>
        <span aria-hidden="true">✦</span>
        <span>Glisser · Composer · Tirer</span>
        <span aria-hidden="true">✦</span>
        <span>Export JSON Schema 2020-12</span>
      </p>
    </header>
  `,
  styles: `
    .masthead {
      padding: 1.1rem var(--gutter) 0;
    }
    .masthead__top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem 1.5rem;
      padding-bottom: 0.8rem;
    }
    .masthead__tagline {
      flex: 1;
      color: var(--ink-soft);
      font-size: 1.05rem;
    }
    .masthead__imprint {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.25rem 1rem;
      padding: 0.45rem 0;
      border-bottom: 1px solid var(--ink);
      color: var(--ink-soft);
      font-size: 0.65rem;
    }
    @media (max-width: 640px) {
      .masthead__imprint span[aria-hidden],
      .masthead__imprint span:last-child {
        display: none;
      }
    }
  `,
})
export class Masthead {}
