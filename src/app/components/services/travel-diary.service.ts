import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, combineLatest, map, Observable, shareReplay, switchMap, take, tap } from 'rxjs';
import { TravelEntry, TravelEntryPayload, User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TravelDiaryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000';
  private readonly currentUserId = 1;
  private readonly refreshTrips$ = new BehaviorSubject<void>(undefined);

  readonly users$ = this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly currentUser$ = this.users$.pipe(
    map((users) => users.find((user) => Number(user.id) === this.currentUserId) ?? null),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly trips$ = this.refreshTrips$.pipe(
    switchMap(() => this.http.get<TravelEntry[]>(`${this.apiUrl}/trips`)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly myTrip$ = this.trips$.pipe(
    map((trips) => trips.find((trip) => trip.userId === this.currentUserId) ?? null),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly publicTrips$ = combineLatest([this.trips$, this.users$]).pipe(
    map(([trips, users]) =>
      trips
        .filter((trip) => trip.userId !== this.currentUserId)
        .map((trip) => ({
          ...trip,
          user: users.find((user) => Number(user.id) === trip.userId)!
        }))
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  saveMyTrip(payload: TravelEntryPayload): Observable<TravelEntry> {
    return this.myTrip$.pipe(
      take(1),
      switchMap((existingTrip) =>
        existingTrip
          ? this.http.patch<TravelEntry>(`${this.apiUrl}/trips/${existingTrip.id}`, payload)
          : this.http.post<TravelEntry>(`${this.apiUrl}/trips`, payload)
      ),
      tap(() => this.refreshTrips$.next())
    );
  }
}
