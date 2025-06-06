import { Routes } from '@angular/router';

import { FavoriteCitiesComponent } from './favorite-cities/favorite-cities.component';
import { authGuard } from './services/auth.guard';
import { HomepageComponent } from './homepage/homepage.component';
import { RedirectorComponent } from './redirector.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthComponent } from './auth/auth.component';
import { GlobeComponent } from './globe/globe.component';

export const routes: Routes = [
  { path: '', component: RedirectorComponent },

  { path: 'home', component: HomepageComponent, canActivate: [authGuard] },
  //{ path: '', component: SearchCityComponent },
  { path: 'login', component: AuthComponent },
  { path: 'signup', component: AuthComponent },
  { path: 'sidebar', component: SidebarComponent },

  // { path: '', component: SearchCityComponent, canActivate: [authGuard] },
  {
    path: 'favorites',
    component: FavoriteCitiesComponent,
    canActivate: [authGuard],
  },
  //{ path: 'test_page', component: WeatherHomeComponent}

  {
    path: 'globe',
    component: GlobeComponent,
    canActivate: [authGuard],
  },
];
