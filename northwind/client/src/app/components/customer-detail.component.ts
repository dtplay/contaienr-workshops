import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NorthwindService, Customer } from '../northwind.service';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css']
})
export class CustomerDetailComponent implements OnInit {

  customer: Customer = { id: -1, company: "" }

  constructor(private nwSvc: NorthwindService, private router: Router, 
      private activtedRoute: ActivatedRoute) { }

  ngOnInit() {
    const id = parseInt(this.activtedRoute.snapshot.params.id)
    this.nwSvc.getCustomerDetail(id)
      .then(result => {
        console.info('details: ', result)
        this.customer = result
      })
      .catch(error => {
        console.error('error: ', error)

      })
  }

  back() {
    this.router.navigate(['/']);

  }
}
