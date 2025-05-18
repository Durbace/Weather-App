import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JokeService {
  constructor(private http: HttpClient) {}

  getJokeOfTheDay(): Observable<string> {
    return this.http.get('/jokes.txt', { responseType: 'text' }).pipe(
      map(text => {
        const jokes = text.split(/\r?\n\r?\n/).map(j => j.trim()).filter(Boolean);
        const today = new Date().toISOString().slice(0, 10);
        const storedDate = localStorage.getItem('jokeDate');
        const storedJoke = localStorage.getItem('jokeOfTheDay');

        if (storedDate === today && storedJoke) {
          return storedJoke;
        }

        const yesterdayJoke = localStorage.getItem('yesterdayJoke');
        let availableJokes = jokes;

        if (yesterdayJoke) {
          availableJokes = jokes.filter(joke => joke !== yesterdayJoke);
        }

        const randomIndex = Math.floor(Math.random() * availableJokes.length);
        const selectedJoke = availableJokes[randomIndex];

        localStorage.setItem('jokeDate', today);
        localStorage.setItem('jokeOfTheDay', selectedJoke);
        localStorage.setItem('yesterdayJoke', selectedJoke);

        return selectedJoke;
      })
    );
  }
}
