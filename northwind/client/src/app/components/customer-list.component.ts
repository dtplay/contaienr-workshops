import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NorthwindService, Customer } from '../northwind.service';
import { load } from '@angular/core/src/render3';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {

  limit = 5
  offset = 0

  customers: Customer[] = []

  constructor(private nwSvc: NorthwindService, private router: Router) { }

  ngOnInit() {
    this.load(this.offset)
  }

  nextPage() {
    if (this.customers.length < this.limit)
      return
    this.offset += this.limit;
    this.load(this.offset)
  }

  prevPage() {
    if (this.offset <= 0)
      return;
    this.offset -= this.limit;
    this.load(this.offset);
  }

  private load(offset: number, limit = this.limit) {
    this.nwSvc.getCustomers({ limit, offset })
      .then((result) => {
        this.customers = result;
      })
      .catch(error => {
        console.error('error: ', error);
      })
  }

  navigateTo(id: number) {
    this.router.navigate(['/customer', id])
  }
}
