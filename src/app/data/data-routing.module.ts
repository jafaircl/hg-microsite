import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DataComponent } from './data.component';
import { DetailComponent } from './detail/detail.component';
import { ListComponent } from './list/list.component';
import { PageComponent } from './page/page.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DataComponent
  }, {
    path: ':type',
    component: ListComponent
  }, {
    path: 'pages/:id',
    component: PageComponent
  }, {
    path: ':type/:id',
    component: DetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DataRoutingModule { }
