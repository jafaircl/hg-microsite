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
  concepts: FirebaseListObservable<any[]>;
  tags: FirebaseListObservable<any[]>;

  specialties: FirebaseListObservable<any[]>;
  conditions: FirebaseListObservable<any[]>;
  procedures: FirebaseListObservable<any[]>;

  constructor(private discover: DiscoverService,
              private watson: WatsonService,
              private db: AngularFireDatabase) { }

  ngOnInit() {
    this.pages = this.db.list('/pages')
    this.keywords = this.db.list('/keywords')
    this.concepts = this.db.list('/concepts')
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
        // console.log(result.url)
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
                      // 'concepts': {},
                      'keywords': {}
                    }
                  }).take(1).subscribe(res => {
                    // console.log(res)
                    const keywords = res.keywords
                    // const concepts = res.concepts
                    const tags = post.dcpTags

                    // Object.assign(post, {syndicationKey: syndicationKey})
                    // push to the pages
                    this.pages.push({
                      syndicationKey: syndicationKey,
                      canonicalPermalink: post.canonicalPermalink,
                      // tags: tags,
                      title: post.seoTitle,
                      description: post.seoDescription,
                      conditions: post.primaryConditions,
                      procedures: post.primaryProcedures,
                      specialties: post.primarySpecialties,
                      userJourneyTags: post.userJourneyTags,
                      type: post.type,
                      // keywords: keywords
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
                      /* keywords.forEach(keyword => {
                        this.db.list(`/pages/${item.key}`).push({
                          text: keyword.text,
                          relevance: keyword.relevance
                        })
                      })
                      tags.forEach(tag => {
                        this.db.list(`/pages/${item.key}`).push(tag)
                      })*/
                    })

                    // this.pushFeature(keywords, 'keywords', syndicationKey)
                    // this.pushFeature(concepts, 'concepts', syndicationKey)
                    // this.pushFeature(tags, 'tags', syndicationKey)

                      /*console.log(item.ref);
                      keywords.forEach(keyword => {
                        const sub = this.db.list('/keywords', {
                          query: {
                            orderByChild: 'keyword',
                            equalTo: keyword.text.toLowerCase()
                          }
                        }).subscribe(kw => {
                          if (kw.length === 0) {
                            this.keywords.push({
                              keyword: keyword.text.toLowerCase(),
                              landingPages: {
                                0: {
                                  syndicationKey: syndicationKey,
                                  relevance: keyword.relevance
                                }
                              }
                            }) // .then(() => sub.unsubscribe())
                          } else {
                            // console.log(syndicationKey);
                            const lpDatabase = this.db.list(`/keywords/${kw[0].$key}/landingPages`, {
                              query: {
                                orderByChild: 'syndicationKey',
                                equalTo: syndicationKey
                              }
                            })
                            const lpSub = lpDatabase.subscribe(lp => {
                              // console.log(lp);
                              if (lp.length === 0) {
                                lpDatabase.push({
                                  syndicationKey: syndicationKey,
                                  relevance: keyword.relevance
                                }).then(() => {
                                  // lpSub.unsubscribe()
                                  // sub.unsubscribe()
                                })
                              }
                            })
                          }
                        })
                      })

                      concepts.forEach(concept => {
                        const sub = this.db.list('/concepts', {
                          query: {
                            orderByChild: 'concept',
                            equalTo: concept.text.toLowerCase()
                          }
                        }).subscribe(c => {
                          if (c.length === 0) {
                            this.concepts.push({
                              concept: concept.text.toLowerCase(),
                              dbpedia_resource: concept.dbpedia_resource,
                              landingPages: {
                                0: {
                                  syndicationKey: syndicationKey,
                                  relevance: concept.relevance
                                }
                              }
                            }) // .then(() => sub.unsubscribe())
                          } else {
                            const lpDatabase = this.db.list(`/concepts/${c[0].$key}/landingPages`, {
                              query: {
                                orderByChild: 'syndicationKey',
                                equalTo: syndicationKey
                              }
                            })
                            const lpSub = lpDatabase.subscribe(lp => {
                              // console.log(lp);
                              if (lp.length === 0) {
                                lpDatabase.push({
                                  syndicationKey: syndicationKey,
                                  relevance: concept.relevance
                                }).then(() => {
                                  // lpSub.unsubscribe()
                                  // sub.unsubscribe()
                                })
                              }
                            })
                          }
                        })
                      })

                      tags.forEach(tag => {
                        const sub = this.db.list('/tags', {
                          query: {
                            orderByChild: 'tag',
                            equalTo: tag
                          }
                        }).subscribe(t => {
                          if (t.length === 0) {
                            this.tags.push({
                              tag: tag,
                              landingPages: {
                                0: {
                                  syndicationKey: syndicationKey
                                }
                              }
                            }) // .then(() => sub.unsubscribe())
                          } else {
                            const lpDatabase = this.db.list(`/tags/${t[0].$key}/landingPages`, {
                              query: {
                                orderByChild: 'syndicationKey',
                                equalTo: syndicationKey
                              }
                            })
                            const lpSub = lpDatabase.subscribe(lp => {
                              // console.log(lp);
                              if (lp.length === 0) {
                                lpDatabase.push({
                                  syndicationKey: syndicationKey
                                }).then(() => {
                                  // lpSub.unsubscribe()
                                  // sub.unsubscribe()
                                })
                              }
                            })
                          }
                        })
                      })*/
                    // })

                    watsonSub.unsubscribe()
                  })
                }
                pageSub.unsubscribe()
              })
              // console.log(post)
              postSub.unsubscribe()
            })
      })
      searchSub.unsubscribe();
    })
    this.offset += this.limit;
  }

  pushFeature(arr, feature: string, syndicationKey: string) {
    arr.forEach(keyword => {
      let text, relevance, dbpedia_resource;
      if (typeof keyword === 'string') {
        text = keyword
        relevance = 0
      } else {
        text = keyword.text
        relevance = keyword.relevance
      }

      if (typeof keyword.dbpedia_resource === 'string') {
        dbpedia_resource = keyword.dbpedia_resource
      } else {
        dbpedia_resource = ''
      }

      const sub = this.db.list('/' + feature, {
        query: {
          orderByChild: 'text',
          equalTo: text.toLowerCase()
        }
      }).subscribe(kw => {
        if (kw.length === 0) {
          this[feature].push({
            text: text.toLowerCase(),
            dbpedia_resource: dbpedia_resource,
            landingPages: {
              0: {
                syndicationKey: syndicationKey,
                relevance: relevance
              }
            }
          }).then(() => sub.unsubscribe())
        } else {
          // console.log(syndicationKey);
          const lpDatabase = this.db.list(`/${feature}/${kw[0].$key}/landingPages`, {
            query: {
              orderByChild: 'syndicationKey',
              equalTo: syndicationKey
            }
          })
          const lpSub = lpDatabase.take(1).subscribe(lp => {
            // console.log(lp)
            // console.log(lp.length)
            if (lp.length === 0) {
              lpSub.unsubscribe()
              sub.unsubscribe()
              lpDatabase.push({
                syndicationKey: syndicationKey,
                relevance: relevance
              })/* .then(() => {
                lpSub.unsubscribe()
                sub.unsubscribe()
              })*/
            }
          })
        }
      })
    })
  }
}
