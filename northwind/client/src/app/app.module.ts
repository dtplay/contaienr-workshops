import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { MaterialModule } from './material.module';
import { AppRouteModule } from './approute.module';

import { NorthwindService } from './northwind.service';
import { CustomerListComponent } from './components/customer-list.component';
import { CustomerDetailComponent } from './components/customer-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    CustomerListComponent,
    CustomerDetailComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }), BrowserAnimationsModule,
    HttpClientModule, FormsModule,
    MaterialModule, AppRouteModule
  ],
  providers: [ NorthwindService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
