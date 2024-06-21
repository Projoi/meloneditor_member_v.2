import { Component, OnInit, ViewChild } from '@angular/core';
import { MemberService } from '../../services/member.service';
import ChoosePlanMember from './interface/ChoosePlanMember';
import ComparisonHeader from './interface/ComparisonHeader';
import ComparisonContent from './interface/ComparisonContent';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import $ from "jquery"
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: "./dashboard.component.css"
})
export class DashboardComponent implements OnInit{

  // @ViewChild(CardComponent) card: CardComponent;

  choosePlanHeader!: string[];
  choosePlanBody!: ChoosePlanMember[];
  comparisonHeaders!: ComparisonHeader[];
  comparisonContent!: ComparisonContent[];

  FREE_PRICE!:string
  PLUS_PRICE!:string
  PRO_PRICE!:string

  USER_USERNAME!: string
  USER_SUB_TYPE!: string
  USER_SUB_DURATION!: string
  USER_IS_FREE!: boolean

  constructor(private memberService: MemberService, private tranlateService: TranslateService, private router: Router) {}

  async ngOnInit() {
    this.GetMemberPrice()
    // this.GetUserMemberInfo()
  }

  async GetMemberPrice() {
    try {
      const MEMBERSHIP_PRICE = await this.memberService.GetMembershipPricesAPI()
      this.FREE_PRICE = "FREE"
      this.PLUS_PRICE = MEMBERSHIP_PRICE[1].price
      this.PRO_PRICE = MEMBERSHIP_PRICE[2].price
      this.getContent()
    } catch (error) {
      console.error(error)
    }
  }

  // async GetUserMemberInfo() {
  //   try {
  //     const MEMBERSHIP_INFO = await this.memberService.GetUserMembershipInfoAPI()
  //     this.USER_SUB_TYPE  = MEMBERSHIP_INFO.role == 1 ? 'PRO' : MEMBERSHIP_INFO.role == 2 ? 'PLUS' : 'FREE';
  //     this.USER_SUB_DURATION = MEMBERSHIP_INFO.membership_duration.slice(0,10);
  //     this.USER_IS_FREE = this.USER_SUB_TYPE == 'FREE' ? false : true;
  //     this.USER_USERNAME = MEMBERSHIP_INFO.username;
  //   } catch (error:any) {
  //     console.error(error.message)
  //   }
  // }

  async CheckLogin(link:string, card_type:any){
    const INFO = await this.memberService.GetUserMembershipInfoAPI()
    if(INFO?.username && INFO?.role){
      if(card_type !== "Free"){
        this.router.navigateByUrl(link)
      }else{
        window.location.href = link
      }
    }else{
      document.querySelector("#popup-login")?.classList.remove("hidden")
    }
  }

  ngAfterViewInit(){
    
    $(".button-close").on("click", function(){
      document.querySelector("#popup-login")?.classList.add("hidden")
    })
  }

  getContent() {
    this.choosePlanHeader = ['Member', 'Price', 'Benefit', 'Subscribe'];

    // Agar lokalisasi translation bisa digunakan dalam TS
    this.tranlateService.get(['DASHBOARD']).subscribe((translations: any) => {
      this.choosePlanBody = [
        {
          image: 'melon_member.png',
          name: 'BASIC',
          price: "Free",
          comparison: translations.DASHBOARD['hero-card-standard-desc'],
          color: '629B3D',
          border_color: '629B3D',
          button_value: translations.DASHBOARD['hero-card-standard-button'],
          link: 'https://editor.melongaming.com/'
        },
        {
          image: 'plus_member.png',
          name: 'PLUS',
          price: `$ ${this.PLUS_PRICE}/${translations.DASHBOARD['hero-card-plus-price']}`,
          comparison: translations.DASHBOARD['hero-card-plus-desc'],
          color: "F7A90B",
          border_color: 'F7A90B',
          button_value: translations.DASHBOARD['hero-card-plus-button'],
          link: 'payment/plus'
        },
        {
          image: 'pro_member.png',
          name: 'PRO',
          price: `$ ${this.PRO_PRICE}/${translations.DASHBOARD['hero-card-pro-price']}`,
          comparison: translations.DASHBOARD['hero-card-pro-desc'],
          color: "F7A90B",
          border_color: 'E27614',
          button_value: translations.DASHBOARD['hero-card-pro-button'],
          link: 'payment/pro'
        }
      ];
    })

    this.tranlateService.get(['COMPARATION']).subscribe((translations: any) => {
      this.comparisonContent = [
        {
          name: 'Export/Import',
          content: [
            { title: translations.COMPARATION['1.1'], tooltip: 'Free: (Minified) \n Plus: (Full Source Code) \n Pro: (Full Source Code)', free: true, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['1.2'], tooltip: '', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['1.3'], tooltip: '(Full source code) only for PLUS/PRO', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['1.4'], tooltip: 'Free: (Ads Supported)', free: true, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['1.5'], tooltip: '(Full source code) only for PLUS/PRO', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['1.6'], tooltip: '(Full source code) only for PRO', free: false, plus: false, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['1.7'], tooltip: '(Full source code) only for PLUS/PRO', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['1.8'], tooltip: '', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' }
          ]
        },
        {
          name: 'Tutorial',
          content: [
            { title: 'Platformer', tooltip: '', free: true, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: `Shoot'em'up`, tooltip: '', free: true, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: 'Puzzle', tooltip: '', free: true, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' }
          ]
        },
        {
          name: 'Instant Games Support',
          content: [
            { title: translations.COMPARATION['2.1'], tooltip: '', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['2.2'], tooltip: '', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['2.3'], tooltip: '', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['2.4'], tooltip: '', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' }
          ]
        },
        {
          name: 'Monetization',
          content: [
            { title: translations.COMPARATION['3.1'], tooltip: '', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['3.2'], tooltip: '', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['3.3'], tooltip: '', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['3.4'], tooltip: '', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' }
          ]
        },
        {
          name: 'Marketplace',
          content: [
            { title: translations.COMPARATION['4.1'], tooltip: '', free: true, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['4.2'], tooltip: '', free: true, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['4.3'], tooltip: '', free: true, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['4.4'], tooltip: 'Plus: (1 Store) \n Pro: (3 Store)', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['4.5'], tooltip: 'Plus: (20 Product) \n Pro: (50 Product)', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['4.6'], tooltip: 'Plus: (100 MB) \n Pro: (200 MB)', free: false, plus: true, pro: true, freeDesc: '', plusDesc: '', proDesc: '' },
            { title: translations.COMPARATION['4.7'], tooltip: '', free: false, plus: false, pro: true, freeDesc: '', plusDesc: '', proDesc: '' }
          ]
        }
      ];
    })
  }

  // newSubscribe(path: string, name: string, type: string) {
  //   if (this.user_authenticate) {
  //     this.router.navigate([path, name, type]);
  //   } else {
  //     document.getElementById("authenticateModal-btn").click();
  //   }
  // }

  goToMelonEditor() {
    localStorage.setItem("history.back", window.location.href);
    window.open('/user/login/', '_self');
  }

}
