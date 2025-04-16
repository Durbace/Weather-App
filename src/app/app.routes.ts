import { Routes } from '@angular/router';

import { SearchCityComponent } from './search-city/search-city.component';
import { CityDetailsComponent } from './city-details/city-details.component';
import { FavoriteCitiesComponent } from './favorite-cities/favorite-cities.component';
import { HomepageComponent } from './homepage/homepage.component';

export const routes: Routes = [

  { path: 'home', component: WeatherHomeComponent },
  //{ path: 'test', component: SearchCityComponent },
  //{ path: '', component: SearchCityComponent }, 
  { path: 'home/:name', component: CityDetailsComponent },
  { path: 'favorites', component: FavoriteCitiesComponent },
  //{ path: 'test_page', component: WeatherHomeComponent}
];
