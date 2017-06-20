import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  type: any;
  data: FirebaseListObservable<any[]>;

  constructor(private db: AngularFireDatabase,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.type = this.route.snapshot.params['type']
    this.data = this.db.list('/' + this.type);
  }

}
