import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';
import CryptoJS from "crypto-js"

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  // Kalau development ini kosong, jadi make full route di url function ya !
  private rootURL: string = environment.rootURL;

  constructor(private http: HttpClient) { }

  HandleFormData(formdata: FormData): FormData {
    let json: { [key: string]: any } = {};
    let list_keys: string[] = [];

    formdata.forEach((entries: any, keys: string) => {
      if (!(entries instanceof File)) {
        json[keys] = entries;
        list_keys.push(keys);
      }
    });

    for (let a = 0; a < list_keys.length; a++) {
        formdata.delete(list_keys[a]);
    }

    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(json), environment.secure_key.toString()).toString();
    formdata.append('d', encryptedData);
    return formdata;
  }

  decryptData(data:any) {
    if(environment.secure == false || !data.r) return data;

    var decData = CryptoJS.AES.decrypt(data.r, environment.secure_key.toString()).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decData);
  }

  encryptData(data:any) {
    if(environment.secure == false) return data;
    
    if(typeof data == 'object') {
      data = JSON.stringify(data);
    } else if(data instanceof FormData) {
      data = this.HandleFormData(data);
      return data
    }

    return {d: CryptoJS.AES.encrypt(data, environment.secure_key.toString()).toString()};
  }

  getEncryptedRequest(url: string = ""): Promise<any> {
    
    const toURL = `${this.rootURL}${url}`;

    return new Promise((resolve, reject) => {
      this.http.get<any>(toURL)
        .subscribe({
          next: (response) => {
            let decryptedData = this.decryptData(response);
            resolve(decryptedData);
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  }

  postEncryptedRequest(url: string = "", post_data: any  = {}) {

    const toURL = `${this.rootURL}${url}`;
    post_data = this.encryptData(post_data)

    return new Promise((resolve, reject) => {
      this.http.post<any>(toURL, post_data)
        .subscribe({
          next: (response) => {
            let decryptedData = this.decryptData(response);
            resolve(decryptedData);
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  } 
}
