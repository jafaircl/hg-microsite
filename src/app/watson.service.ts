import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

declare const Buffer

@Injectable()
export class WatsonService {
  baseUrl = 'https://gateway.watsonplatform.net/natural-language-understanding/api/v1/analyze?version=2017-02-27';
  username = 'c8bdb3f6-3f62-4bf8-b35e-c5f3e7c1d6e8';
  password = '4X1QPfCDjllF';

  constructor(private http: Http) { }

  analyze(data) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + new Buffer(this.username + ':' + this.password).toString('base64')
    });
    const options = new RequestOptions({ headers: headers });

    return this.http
               .post(this.baseUrl, data, options)
               .map(response => response.json());
  }
}
