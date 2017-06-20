import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {
  id: any;
  data: FirebaseListObservable<any[]>;
  keywords: FirebaseListObservable<any[]>;
  tags: FirebaseListObservable<any[]>;

  constructor(private db: AngularFireDatabase,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id']
    this.data = this.db.list('/pages', {
      query: {
        orderByChild: 'syndicationKey',
        equalTo: this.id
      }
    })

    const arr = ['keywords', 'tags']

    for (let i = 0; i < arr.length; i++) {
      this.data.subscribe(page => {
        this[arr[i]] = this.db.list('/' + arr[i], {
          query: {
            orderByChild: page[0].$key,
            startAt: 0
          }
        })
      })
    }
  }
}
