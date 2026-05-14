export interface User {
  id: string;
  fullName: string;
  city: string;
  about: string;
}

export interface TravelRatings {
  comfort: number;
  safety: number;
  population: number;
  greenery: number;
}

export interface TravelEntry {
  id: string;
  userId: number;
  destination: string;
  travelDate: string;
  description: string;
  cost: number;
  imageUrl: string;
  ratings: TravelRatings;
}

export interface TravelEntryPayload {
  userId: number;
  destination: string;
  travelDate: string;
  description: string;
  cost: number;
  imageUrl: string;
  ratings: TravelRatings;
}

