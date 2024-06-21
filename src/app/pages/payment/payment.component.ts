import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { NgxPayPalModule } from "ngx-paypal"
import { environment } from '../../../environments/environment';
import $ from "jquery"
import { MemberService } from '../../services/member.service';
import { RequestService } from '../../services/request.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [NgxPayPalModule, RouterLink, TranslateModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})

export class PaymentComponent implements OnInit {
  public MEMBERTYPE: number;
  private PLUS_PRICE: number = 12
  private PRO_PRICE: number = 99
  public SELECTED_PRICE: number = 12;
  public SELECTED_PRICE_MULTIPLIER: number = 1;
  public payPalConfig?: IPayPalConfig;

  SUBS_TYPE?: string
  SUBS_DURATION?: any
  SUBS_DURATION_NEW?: any
  SUBS_DURATION_NEW_FORMAT?: any

  PAYMENT_TYPE: any

  SUCCESS_MESSAGE?:String;


  constructor(private router: Router, private memberService: MemberService, private requestService: RequestService, private translateService: TranslateService) {
    this.MEMBERTYPE = this.router.url.split("/").pop() == "pro" ? 1 : 0;
  }

  initContent(){
    this.translateService.get(['PAYMENT']).subscribe((translations: any) => {

      this.PAYMENT_TYPE = [
        {
          type: "Plus",
          image: "plus_member.png",
          content: [
            {index:0, title: `1 ${translations.PAYMENT['payment-select']}`, price:this.PLUS_PRICE, multiplier:1},
            {index:1, title: `6 ${translations.PAYMENT['payment-select']}`, price:this.PLUS_PRICE*6, multiplier:6},
            {index:2, title: `12 ${translations.PAYMENT['payment-select']}`, price:this.PLUS_PRICE*12, multiplier:12}
          ]
        },
        {
          type: "Pro",
          image: "pro_member.png",
          content: [
            {index:0, title: `1 ${translations.PAYMENT['payment-select']}`, price:this.PRO_PRICE, multiplier:1},
            {index:1, title: `6 ${translations.PAYMENT['payment-select']}`, price:this.PRO_PRICE*6, multiplier:6},
            {index:2, title: `12 ${translations.PAYMENT['payment-select']}`, price:this.PRO_PRICE*12, multiplier:12}
          ]
        }
      ]
    })
  }






  async ngOnInit() {
    const INFO = await this.memberService.GetUserMembershipInfoAPI()
    if(!INFO?.username || !INFO?.role) this.router.navigateByUrl("/")
    this.initContent()
    this.initConfig()
    this.GetUserMembershipInfo()
  }

  upgradeMembership(purchase_type: string, purchase_duration:number, price:number, data:any){
    this.requestService.postEncryptedRequest('/user/upgrade-membership', {type: purchase_type, duration: purchase_duration, price: price, payer: data.payer})
    .then((result : any) => {
      this.SUCCESS_MESSAGE = result.message;

      // SHOW SUCCESS POPUP WHEN USER UPGRADED TO NEW ROLE
      document.querySelector("#success-popup")?.classList.remove("hidden")
    })
    .catch((err) => {
      console.log("Error upgrade Membership", err);
    })
  }

  dateFormatter(inputDate: string): string {
    const dateObj = new Date(inputDate);
    const options: Intl.DateTimeFormatOptions = { 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
    };

    const formattedDate = dateObj.toLocaleDateString("id-ID", options);
    return formattedDate;
  }




  async GetUserMembershipInfo(){
    const USER_MEMBERSHIP = await this.memberService.GetUserMembershipInfoAPI()
    this.SUBS_TYPE  = USER_MEMBERSHIP.role == 1 ? 'PRO' : USER_MEMBERSHIP.role == 2 ? 'PLUS' : 'FREE';
    this.SUBS_DURATION = USER_MEMBERSHIP.membership_duration.slice(0,10);

    let DATE = this.SUBS_TYPE == 'FREE' ? new Date() : new Date(this.SUBS_DURATION);
    
    DATE.setMonth(DATE.getMonth() + this.SELECTED_PRICE_MULTIPLIER)
    this.SUBS_DURATION_NEW = DATE.getFullYear()+'-'+(DATE.getMonth()+1)+'-'+DATE.getDate();

    this.SUBS_DURATION_NEW_FORMAT = this.dateFormatter(this.SUBS_DURATION_NEW);
  }




  ngAfterViewInit(){
    // init, pas buka payment page, langsung select yang paling atas
    $(".button-select-subs").eq(0).addClass("selected")
    
    $(".button-select-subs").on("click", function(){
      // handle button select di payment page
      $(".button-select-subs").each(function(){
        $(this).removeClass("selected")
      })
      $(this).addClass("selected")
    })
  }

  handleSelectedPrice(index:number){
    this.SELECTED_PRICE = this.PAYMENT_TYPE[this.MEMBERTYPE].content[index].price
    this.SELECTED_PRICE_MULTIPLIER = this.PAYMENT_TYPE[this.MEMBERTYPE].content[index].multiplier
    this.GetUserMembershipInfo()
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'USD',
      clientId: environment.paypal_client_id,
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: `${this.SELECTED_PRICE}`,
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: `${this.SELECTED_PRICE}`
                }
              }
            },
            items: [
              {
                name: `${this.MEMBERTYPE ? "PRO MEMBERSHIP" : "PLUS MEMBERSHIP"}`,
                quantity: '1',
                category: 'DIGITAL_GOODS',
                unit_amount: {
                  currency_code: 'USD',
                  value: `${this.SELECTED_PRICE}`,
                },
              }
            ]
          }
        ]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        
        actions.order.get().then((details:any) => {
          console.log('onApprove - you can get full order details inside onApprove: ', details);
          document.getElementById('progress-btn')?.click();
        });      
      },
      onClientAuthorization: (data) => {
        this.upgradeMembership(this.MEMBERTYPE == 1 ? "PRO" : "PLUS", this.SELECTED_PRICE_MULTIPLIER, this.SELECTED_PRICE, data)
        console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
      },
      onError: err => {
        console.log('OnError', err);
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
      },
    };
  }


  
}
