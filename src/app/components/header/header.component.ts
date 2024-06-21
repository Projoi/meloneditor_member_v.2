import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {

  constructor(private translateService: TranslateService){}

  SELECTED_LANGUAGE: string = localStorage.getItem("lang") || "en"

  ngOnInit(){
    localStorage.setItem("lang" ,this.SELECTED_LANGUAGE)
  }

  ChangeLang(event: any){
    this.SELECTED_LANGUAGE = event.target.value;
    localStorage.setItem("lang" ,this.SELECTED_LANGUAGE)
    location.reload()

    this.translateService.use(this.SELECTED_LANGUAGE)
  }
}
