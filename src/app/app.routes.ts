import { Routes } from '@angular/router';

import { SearchCityComponent } from './search-city/search-city.component';
import { CityDetailsComponent } from './city-details/city-details.component';
import { FavoriteCitiesComponent } from './favorite-cities/favorite-cities.component';
import { HomepageComponent } from './homepage/homepage.component';

export const routes: Routes = [

<<<<<<< Updated upstream
  { path: 'home', component: WeatherHomeComponent },
  //{ path: 'test', component: SearchCityComponent },
  //{ path: '', component: SearchCityComponent }, 
  { path: 'home/:name', component: CityDetailsComponent },
  { path: 'favorites', component: FavoriteCitiesComponent },
=======
  { path: 'home', component: HomepageComponent, canActivate: [authGuard] },
  { path: 'test', component: SearchCityComponent, canActivate: [authGuard] },
  //{ path: '', component: SearchCityComponent }, 
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'favorites', component: FavoriteCitiesComponent, canActivate: [authGuard] },
  { path: 'city/:name', component: CityDetailsComponent, canActivate: [authGuard] }
>>>>>>> Stashed changes
  //{ path: 'test_page', component: WeatherHomeComponent}
];
