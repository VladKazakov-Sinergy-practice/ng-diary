import { Routes } from '@angular/router';
import { PublicTripsPageComponent } from './components/public-trips-page/public-trips-page.component';
import { TravelFormPageComponent } from './components/travel-form-page/travel-form-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'my-trip' },
  { path: 'my-trip', component: TravelFormPageComponent, title: 'Моя запись' },
  { path: 'community', component: PublicTripsPageComponent, title: 'Путешествия других' },
  { path: '**', redirectTo: 'my-trip' }
];
