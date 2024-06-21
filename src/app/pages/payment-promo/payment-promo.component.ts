import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { NgxPayPalModule } from "ngx-paypal"
import { environment } from '../../../environments/environment';
import $ from "jquery"
import { MemberService } from '../../services/member.service';
import { RequestService } from '../../services/request.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-promo',
  standalone: true,
  imports: [NgxPayPalModule, RouterLink, TranslateModule],
  templateUrl: './payment-promo.component.html',
  styleUrl: './payment-promo.component.css'
})
export class PaymentPromoComponent implements OnInit {
  // PARAMS GET FROM URL
  PROMO_ID?:string
  PRODUCT_ID?:string
  CLICK_ID?:string
  PROMO_ITEM_ID?:string

  LIST_PROMO:any = {}

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

  PAYMENT_TYPE: any = []

  SUCCESS_MESSAGE?:String;


  constructor(private router: Router, private route: ActivatedRoute, private memberService: MemberService, private requestService: RequestService, private translateService: TranslateService) {
    this.MEMBERTYPE = this.router.url.split("/").pop() == "pro" ? 1 : 0;
    this.route.queryParams.subscribe(param => {
      // MEMBERSHIP PROMO PRICE
      this.PROMO_ID = param["id"]

      // MEMBERSHIP PRICE
      this.PRODUCT_ID = param["prod_id"]
      this.CLICK_ID = param["click_id"]

      // SPECIFIC PROMO FOR ONE ITEM
      this.PROMO_ITEM_ID = param['promo_id']
    })
  }

  async ngOnInit() {
    const INFO = await this.memberService.GetUserMembershipInfoAPI()
    const PRICE = await this.memberService.GetMembershipPricesAPI()
    
    if(!INFO?.username || !INFO?.role) this.router.navigateByUrl("/")

    // Handle diskonan price
    if(PRICE){
      // Kalau diskonnya hanya 1 item saja?
      if(this.PRODUCT_ID){
        let product_data = PRICE.filter((value:any, index:number) => {
          return value.id == parseInt(this.PRODUCT_ID!)
        })[0]

        // Kalau product id tidak ditemukan di db navigate ke home
        if(!product_data) this.router.navigateByUrl("/")

        this.PROMO_ITEM_ID = this.PRODUCT_ID;

        this.LIST_PROMO.list_value = [{
          "id": 1,
          "value": 9,
          "duration": 1,
          "text": "1 Month PLUS",
          "membership_type": "PLUS",
          "price": product_data.price,
          "idr": product_data.idr,
          "createdAt": null,
          "updatedAt": null
        }]
        
        return;
      }


      const PROMO = await this.memberService.GetMembershipPromoPricesAPI(this.PROMO_ID)
      
      if(PROMO.type == "login") return alert("YOU HAVE TO LOGIN")
      if(PROMO.message) return alert(PROMO.message)
      this.LIST_PROMO = PROMO

      // DISKON YANG MANA AJA YANG BAKAL DI AMBIL
      this.LIST_PROMO.list_value = JSON.parse(this.LIST_PROMO.list_value)

      // PROMO HANYA UNTUK 1 ITEM
      if(this.PROMO_ITEM_ID) {
        this.LIST_PROMO.list_value = [this.LIST_PROMO.list_value.find((element:any) => element.id == this.PROMO_ITEM_ID)];
      }

      // LOOP, COCOKIN KODE DISKON YANG DIPAKE SAMA DISKON YANG ADA
      this.LIST_PROMO.list_value.forEach((promo_item:any, counter:number) => {
        PRICE.forEach((item:any) => {

          // KALAU ID DI PRICE SAMA DENGAN ID DI DISKON
          if(item.id == this.LIST_PROMO.list_value[counter].id) {

            // TAMBAHIN DATA DI PRICE KE DISKON
            this.LIST_PROMO.list_value[counter] = {...this.LIST_PROMO.list_value[counter],...item}  
            // PRICE BEFORE = HARGA ASLI
            this.LIST_PROMO.list_value[counter].pricebefore = item.price;

            // MENCARI YANG ADA _ NYA, PLUS_6_DISC, PLUS_12_DISC DAN MENGHILANGKAN DARI _ SAMPE AKHIR JADI CUMA PLUS/PRO
            if(this.LIST_PROMO.list_value[counter].membership_type.search('_') >= 0) {
              this.LIST_PROMO.list_value[counter].membership_type = this.LIST_PROMO.list_value[counter].membership_type.substr(0, this.LIST_PROMO.list_value[counter].membership_type.search('_'))
            }

            // ??? 
            this.LIST_PROMO.list_value[counter].duration_month = this.LIST_PROMO.list_value[counter].duration
            
            // ???
            if(this.LIST_PROMO.list_value[counter].type_duration == 'day') {
              this.LIST_PROMO.list_value[counter].duration_month = this.LIST_PROMO.list_value[counter].duration /30
            }

            // MULTIPLY PRICE SAMA DURASI BULAN AGAR SESUAI HARGA
            this.LIST_PROMO.list_value[counter].price *= this.LIST_PROMO.list_value[counter].duration_month;

            if(this.LIST_PROMO.type_value == 'p'){
              const discount = (this.LIST_PROMO.list_value[counter].value/100) * item.price * this.LIST_PROMO.list_value[counter].duration_month;
              
              this.LIST_PROMO.list_value[counter].pricebefore -= discount;
              this.LIST_PROMO.list_value[counter].price -= discount;
              if(this.LIST_PROMO.list_value[counter].price <=0){
                this.LIST_PROMO.list_value[counter].price = 0;
              }
            } else {
              this.LIST_PROMO.list_value[counter].price -= this.LIST_PROMO.list_value[counter].value; 
            }
          }
        })
      })
    }

    this.initContent()
    this.GetUserMembershipInfo()
    this.initConfig();
  }

  initContent(){
    this.SELECTED_PRICE_MULTIPLIER = this.LIST_PROMO.list_value[0].duration
    this.translateService.get(['PAYMENT']).subscribe((translations: any) => {
      this.PAYMENT_TYPE.push({
        type: this.LIST_PROMO.list_value[0].membership_type,
        image: "plus_member.png",
        content: []
      })

      this.LIST_PROMO.list_value.forEach((item:any, index:number) => {
        let content = {index, title: item.text, price:item.price, price_before:item.pricebefore, multiplier:item.duration}
        this.PAYMENT_TYPE[0].content.push(content)
      })
    })

    this.SELECTED_PRICE = this.PAYMENT_TYPE[0].content[0].price
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
    this.SELECTED_PRICE = this.PAYMENT_TYPE[0].content[index].price
    this.SELECTED_PRICE_MULTIPLIER = this.PAYMENT_TYPE[this.MEMBERTYPE].content[index].multiplier
    this.GetUserMembershipInfo()
  }






  // Paypall configuration
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
  // Mengubah dari date format DD/MM/YYYY jadi DD/Month/YYYY
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

}
