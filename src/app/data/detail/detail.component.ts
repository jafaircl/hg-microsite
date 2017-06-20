import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/take'

import { AngularFireDatabase, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  type: any;
  id: any;
  item: FirebaseListObservable<any[]>;
  pages: FirebaseListObservable<any[]>;
  relations = [];
  search: any;

  constructor(private db: AngularFireDatabase,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      let itemSub, searchSub
      this.relations = [];
      this.type = params['type']
      this.id = params['id']
      this.search = this.type === 'tags' ? 'keywords' : 'tags'
      this.item = this.db.list(`/${this.type}/${this.id}`, {
        query: {
          orderByChild: 'relevance'
        }
      })

      itemSub = this.item.take(1).subscribe(term => {
        term.forEach(thing => {
          searchSub = this.db.list(`/${this.search}`, {
            query: {
              orderByChild: thing.$key,
              startAt: 0
            }
          }).take(1).subscribe(list => {
            list.forEach(i => {
              if (this.relations.filter(e => e.$key === i.$key).length === 0) {
                this.relations.push(i)
              }
            })
            searchSub.unsubscribe()
          })
        })
        itemSub.unsubscribe()
      })
    })
  }

  unslugify(text: string) {
    return text.replace(/-/g, ' ')
  }
}
