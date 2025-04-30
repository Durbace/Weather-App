import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SearchCityComponent } from "../search-city/search-city.component";
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-weather-home',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ChartModule,
    SearchCityComponent,
    SidebarComponent,
    SearchCityComponent,
],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent {
  cardTitles = [
    'Temperature card',
    'Precipitation (rain + showers + snow)',
    'Precipitation Probability',
    'Visibility',
    'UV index',
    'Apparent Temperature'
  ];
  
  chartData = {
    labels: ['13 Mar', '14 Mar', '15 Mar', '16 Mar', '17 Mar', '18 Mar', '19 Mar', '20 Mar'],
    datasets: [
      {
        label: 'Temperature',
        data: [12, 24, 18, 27, 20, 10, 5, 15],
        fill: false,
        borderColor: '#42A5F5',
        tension: 0.35
      }
    ]
  };

  
}