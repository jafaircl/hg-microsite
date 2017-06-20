import { RouterModule, Routes } from '@angular/router';

import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: '',
    loadChildren: 'app/home/home.module#HomeModule'
  }, {
    path: 'load-data',
    loadChildren: 'app/load-data/load-data.module#LoadDataModule'
  }, {
    path: 'data',
    loadChildren: 'app/data/data.module#DataModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
