import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {

  constructor(private translateService: TranslateService){
    this.translateService.addLangs(['en', 'idn']);
    this.translateService.setDefaultLang('en');

    this.translateService.use(localStorage.getItem('lang') || "en");
  }

  title = 'meloneditor_member_v.2';
}
