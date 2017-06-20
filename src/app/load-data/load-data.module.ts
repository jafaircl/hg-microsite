import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AngularFireDatabaseModule } from 'angularfire2/database';

import { LoadDataRoutingModule } from './load-data-routing.module';
import { LoadDataComponent } from './load-data.component';

@NgModule({
  imports: [
    CommonModule,
    LoadDataRoutingModule,
    AngularFireDatabaseModule,
  ],
  declarations: [LoadDataComponent]
})
export class LoadDataModule { }
