import { NgModule } from "@angular/core";
import { RouterModule, Routes } from '@angular/router';

import { CustomerListComponent } from './components/customer-list.component';
import { CustomerDetailComponent } from './components/customer-detail.component';

const ROUTES: Routes = [
    { path: '', component: CustomerListComponent },
    { path: 'customers', component: CustomerListComponent },
    { path: 'customer/:id', component: CustomerDetailComponent },
    { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
    imports: [ RouterModule.forRoot(ROUTES) ],
    exports: [ RouterModule ]
})
export class AppRouteModule { }