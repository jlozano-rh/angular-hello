import { Component } from '@angular/core';
import Config from "../config.json";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-project';
  environment = Config.ENV;
  baseUrl = Config.BASE_URL;
}
