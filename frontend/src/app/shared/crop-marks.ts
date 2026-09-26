import { Component } from '@angular/core';

/** Traits de coupe aux quatre coins du parent (qui doit etre en position relative). */
@Component({
  selector: 'app-crop-marks',
  host: { class: 'crop-marks', 'aria-hidden': 'true' },
  template: '<i></i><i></i><i></i><i></i>',
})
export class CropMarks {}
