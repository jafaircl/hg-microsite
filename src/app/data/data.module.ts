import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AngularFireDatabaseModule } from 'angularfire2/database';

import { DataRoutingModule } from './data-routing.module';
import { DataComponent } from './data.component';
import { DetailComponent } from './detail/detail.component';
import { ListComponent } from './list/list.component';
import { PageComponent } from './page/page.component';

@NgModule({
  imports: [
    CommonModule,
    DataRoutingModule,
    AngularFireDatabaseModule,
  ],
  declarations: [
    DataComponent,
    DetailComponent,
    ListComponent,
    PageComponent
  ]
})
export class DataModule { }
