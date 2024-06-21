import { Injectable } from '@angular/core';
import { RequestService } from './request.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private requestService: RequestService) { }

  async CheckIsUserAuthenticate() {
    try {
      const isUserAuthenticate = await this.requestService.getEncryptedRequest("/user/check-user-authenticate");
      return isUserAuthenticate
    } catch (error) {
      console.error('Error on Check User Authentication:', error);
    }
  }
}
