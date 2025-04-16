import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, firstValueFrom } from 'rxjs';

export interface FavoriteCity {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })
export class FavoriteCityStorageService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private async getUserId(): Promise<string | null> {
    const user = await firstValueFrom(authState(this.auth));
    return user?.uid || null;
  }

  private async getFavoritesCollectionPath(): Promise<string | null> {
    const uid = await this.getUserId();
    return uid ? `users/${uid}/favorites` : null;
  }

  async getFavorites(): Promise<FavoriteCity[]> {
    const path = await this.getFavoritesCollectionPath();
    if (!path) return [];

    const ref = collection(this.firestore, path);
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(docSnap => ({ ...(docSnap.data() as FavoriteCity), id: docSnap.id }));
  }

  async addFavorite(city: FavoriteCity): Promise<void> {
    const path = await this.getFavoritesCollectionPath();
    if (!path) return;

    const ref = collection(this.firestore, path);
    await addDoc(ref, city);
  }

  async deleteFavorite(cityName: string): Promise<void> {
    const path = await this.getFavoritesCollectionPath();
    if (!path) return;

    const ref = collection(this.firestore, path);
    const snapshot = await getDocs(query(ref, where('name', '==', cityName)));

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(this.firestore, `${path}/${docSnap.id}`));
    }
  }
}
