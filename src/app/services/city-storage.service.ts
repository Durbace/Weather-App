import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { City } from './city.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CityStorageService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async getCities(): Promise<City[]> {
    const user = await firstValueFrom(authState(this.auth));
    if (!user) return [];
    const ref = collection(this.firestore, `users/${user.uid}/cities`);
    const snapshot = await getDocs(ref);
    return snapshot.docs.map((doc) => ({
      ...(doc.data() as City),
      id: doc.id,
    }));
  }

  async addCity(city: City): Promise<void> {
    try {
      const user = await firstValueFrom(authState(this.auth));
      if (!user) return;

      const ref = collection(this.firestore, `users/${user.uid}/cities`);
      await addDoc(ref, city);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async deleteCity(id: string): Promise<void> {
    const user = await firstValueFrom(authState(this.auth));
    if (!user) return;

    const docRef = doc(this.firestore, `users/${user.uid}/cities/${id}`);
    await deleteDoc(docRef);
  }
}
