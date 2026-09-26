import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Forme — le marbre',
    loadComponent: () => import('./features/library/library.page').then((m) => m.LibraryPage),
  },
  {
    path: 'atelier/:id',
    title: 'Forme — composition',
    loadComponent: () => import('./features/builder/builder.page').then((m) => m.BuilderPage),
  },
  {
    path: 'atelier/:id/tirages',
    title: 'Forme — registre des tirages',
    loadComponent: () =>
      import('./features/submissions/submissions.page').then((m) => m.SubmissionsPage),
  },
  {
    path: 'f/:slug',
    loadComponent: () =>
      import('./features/public-form/public-form.page').then((m) => m.PublicFormPage),
  },
  { path: '**', redirectTo: '' },
];
