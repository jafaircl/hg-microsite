import { Component, OnInit } from '@angular/core';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import 'rxjs/add/operator/take'

import { DiscoverService } from '../discover.service';
import { WatsonService } from '../watson.service';

export function slugify (text) {
  const a = 'àáäâèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
  const b = 'aaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(p, c =>
        b.charAt(a.indexOf(c)))     // Replace special chars
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

@Component({
  selector: 'app-load-data',
  templateUrl: './load-data.component.html',
  styleUrls: ['./load-data.component.scss']
})
export class LoadDataComponent implements OnInit {
  limit = 100;
  offset = 0;
  items = [];
  pages: FirebaseListObservable<any[]>;
  keywords: FirebaseListObservable<any[]>;
  tags: FirebaseListObservable<any[]>;

  constructor(private discover: DiscoverService,
              private watson: WatsonService,
              private db: AngularFireDatabase) { }

  ngOnInit() {
    this.pages = this.db.list('/pages')
    this.keywords = this.db.list('/keywords')
    this.tags = this.db.list('/tags')
  }

  getItems() {
    const searchSub = this.discover.search({
      text: '',
      type: '',
      dcp: '',
      sort: 'published',
      limit: this.limit,
      offset: this.offset
    }).subscribe(results => {
      results.forEach(result => {

        const syndicationKey = result.syndicationKey;
        this.items.push(result)
        const postSub = this.discover.getPost(syndicationKey)
            .subscribe(post => {
              // check if the page exists in the database
              const pageSub = this.db.list('/pages', {
                query: {
                  orderByChild: 'syndicationKey',
                  equalTo: syndicationKey
                }
              }).subscribe(test => {

                if (test.length === 0) {
                  // get keywords and concepts for the page
                  const watsonSub = this.watson.analyze({
                    'url': post.canonicalPermalink,
                    'features': {
                      'keywords': {}
                    }
                  }).take(1).subscribe(res => {
                    const keywords = res.keywords
                    const tags = post.dcpTags

                    // push to the pages
                    this.pages.push({
                      syndicationKey: syndicationKey,
                      canonicalPermalink: post.canonicalPermalink,
                      title: post.seoTitle,
                      description: post.seoDescription,
                      conditions: post.primaryConditions,
                      procedures: post.primaryProcedures,
                      specialties: post.primarySpecialties,
                      userJourneyTags: post.userJourneyTags,
                      type: post.type,
                    }).then(item => {
                      keywords.forEach(keyword => {
                        this.db.list(`/keywords/${slugify(keyword.text)}`).update(item.key, {
                          syndicationKey: syndicationKey,
                          relevance: 0 - keyword.relevance,
                          title: post.seoTitle
                        })
                      })

                      tags.forEach(tag => {
                        this.db.list(`/tags/${slugify(tag)}`).update(item.key, {
                          syndicationKey: syndicationKey,
                          title: post.seoTitle
                        })
                      })
                    })
                    watsonSub.unsubscribe()
                  })
                }
                pageSub.unsubscribe()
              })
              postSub.unsubscribe()
            })
      })
      searchSub.unsubscribe();
    })
    this.offset += this.limit;
  }
}
