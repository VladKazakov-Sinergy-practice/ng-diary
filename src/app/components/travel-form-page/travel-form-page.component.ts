import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TravelEntryPayload } from '../models/models';
import { TravelDiaryService } from '../services/travel-diary.service';

@Component({
  selector: 'app-travel-form-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './travel-form-page.component.html'
})
export class TravelFormPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly diaryService = inject(TravelDiaryService);

  readonly currentUser$ = this.diaryService.currentUser$;
  readonly myTrip$ = this.diaryService.myTrip$;
  readonly imagePreview = signal<string>('');
  readonly saveState = signal<'idle' | 'saving' | 'success'>('idle');

  readonly travelForm = this.fb.nonNullable.group({
    destination: ['', [Validators.required, Validators.maxLength(80)]],
    travelDate: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(20)]],
    cost: [0, [Validators.required, Validators.min(0)]],
    imageUrl: ['', Validators.required],
    comfort: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    safety: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    population: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    greenery: [3, [Validators.required, Validators.min(1), Validators.max(5)]]
  });

  constructor() {
    this.myTrip$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((trip) => {
        if (!trip) {
          return;
        }

        this.travelForm.patchValue({
          destination: trip.destination,
          travelDate: trip.travelDate,
          description: trip.description,
          cost: trip.cost,
          imageUrl: trip.imageUrl,
          comfort: trip.ratings.comfort,
          safety: trip.ratings.safety,
          population: trip.ratings.population,
          greenery: trip.ratings.greenery
        });
        this.imagePreview.set(trip.imageUrl);
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      this.imagePreview.set(result);
      this.travelForm.controls.imageUrl.setValue(result);
      this.travelForm.controls.imageUrl.markAsDirty();
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.travelForm.invalid) {
      this.travelForm.markAllAsTouched();
      return;
    }

    this.saveState.set('saving');

    const value = this.travelForm.getRawValue();
    const payload: TravelEntryPayload = {
      userId: 1,
      destination: value.destination,
      travelDate: value.travelDate,
      description: value.description,
      cost: value.cost,
      imageUrl: value.imageUrl,
      ratings: {
        comfort: value.comfort,
        safety: value.safety,
        population: value.population,
        greenery: value.greenery
      }
    };

    this.diaryService
      .saveMyTrip(payload)
      .pipe(
        finalize(() => {
          if (this.saveState() === 'saving') {
            this.saveState.set('idle');
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.saveState.set('success');
      });
  }
}
