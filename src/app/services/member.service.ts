import { Injectable } from '@angular/core';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(private requestService: RequestService) { }

  async GetMembershipPricesAPI() {
    try {
      const priceData = await this.requestService.getEncryptedRequest("/user/get-membership-price-info");
      return priceData
    } catch (error) {
      console.error('Error on Get Membership Price:', error);
    }
  }

  async GetMembershipPromoPricesAPI(id:any) {
    try {
      const priceData = await this.requestService.getEncryptedRequest(`/user/get-membership-promo-price?id=${id}`);
      return priceData
    } catch (error) {
      console.error('Error on Get Membership Price:', error);
    }
  }

  async GetUserMembershipInfoAPI() {
    try {
      const userData = await this.requestService.getEncryptedRequest("/user/get-user-membership-info");
      return userData
    } catch (error) {
      console.error('Error on Get Membership Price:', error);
    }
  }
}
