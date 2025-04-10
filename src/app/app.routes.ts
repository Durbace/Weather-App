import { Routes } from '@angular/router';

import { SearchCityComponent } from './search-city/search-city.component';
import { CityDetailsComponent } from './city-details/city-details.component';
import { FavoriteCitiesComponent } from './favorite-cities/favorite-cities.component';

export const routes: Routes = [
  { path: '', component: SearchCityComponent }, 
  { path: 'city/:name', component: CityDetailsComponent } ,
  { path: 'favorites', component: FavoriteCitiesComponent }

];
