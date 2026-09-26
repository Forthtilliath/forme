import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * « FORME. » avec sa croix de reperage. Au survol, les lettres s'etirent
 * (axe de chasse variable d'Anybody) comme un caractere qu'on elargit.
 */
@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  template: `
    <a routerLink="/" class="logo" [class.logo--sm]="small()" aria-label="Forme — retour au marbre">
      <svg class="logo__mark" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M16 3v26M3 16h26" stroke="currentColor" stroke-width="2" />
        <circle class="logo__dot" cx="17.5" cy="17.2" r="4" />
      </svg>
      <span class="logo__word display">Forme<span class="logo__period">.</span></span>
    </a>
  `,
  styles: `
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }
    .logo__mark {
      width: 1.9rem;
      height: 1.9rem;
      transition: transform 400ms var(--ease-out);
    }
    .logo__dot {
      fill: var(--vermillon);
      mix-blend-mode: multiply;
    }
    .logo__word {
      font-size: 2.1rem;
      font-variation-settings: 'wdth' 58;
      transition: font-variation-settings 380ms var(--ease-out);
    }
    .logo__period {
      color: var(--vermillon);
    }
    .logo:hover .logo__word {
      font-variation-settings: 'wdth' 132;
    }
    .logo:hover .logo__mark {
      transform: rotate(90deg);
    }
    .logo--sm .logo__word {
      font-size: 1.5rem;
    }
    .logo--sm .logo__mark {
      width: 1.4rem;
      height: 1.4rem;
    }
  `,
})
export class Logo {
  readonly small = input(false);
}
