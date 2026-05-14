import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TravelDiaryService } from '../services/travel-diary.service';

@Component({
  selector: 'app-public-trips-page',
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './public-trips-page.component.html'
})
export class PublicTripsPageComponent {
  private readonly diaryService = inject(TravelDiaryService);

  readonly publicTrips$ = this.diaryService.publicTrips$;
}
