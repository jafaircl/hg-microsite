import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadDataComponent } from './load-data.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LoadDataComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoadDataRoutingModule { }
