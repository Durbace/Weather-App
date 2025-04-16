import { Routes } from '@angular/router';
import { SearchCityComponent } from './search-city/search-city.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FavoriteCitiesComponent } from './favorite-cities/favorite-cities.component';
import { CityDetailsComponent } from './city-details/city-details.component';
import { authGuard } from './services/auth.guard';
import { HomepageComponent } from './homepage/homepage.component';

export const routes: Routes = [

  { path: 'home', component: HomepageComponent, canActivate: [authGuard] },
  { path: 'test', component: SearchCityComponent },
  //{ path: '', component: SearchCityComponent }, 
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  { path: '', component: SearchCityComponent, canActivate: [authGuard] },
  { path: 'favorites', component: FavoriteCitiesComponent, canActivate: [authGuard] },
  { path: 'city/:name', component: CityDetailsComponent, canActivate: [authGuard] }
  //{ path: 'test_page', component: WeatherHomeComponent}
];
