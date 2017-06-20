import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class DiscoverService {
  baseUrl = 'https://healthguides.healthgrades.com/ucms/api/syndicated'

  constructor(private http: Http) { }

  search(input: Object): Observable<any> {
    let url = this.baseUrl + '/search?';

    for (const field in input) {
      if (input[field] !== undefined) {
        url += `${field}=${input[field]}&`;
      }
    }
    return this.http.get(url.slice(0, -1)).map(response => response.json().results);
  }

  getPost(slug: string): Observable<any> {
    return this.http.get(this.baseUrl + '/' + slug).map(response => response.json())
  }
}
