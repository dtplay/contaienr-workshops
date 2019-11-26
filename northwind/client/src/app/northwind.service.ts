import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface Customer {
    id: number;
    company: string;
    first_name?: string;
    last_name?: string;
    email_address?: string;
    job_title?: string;
    business_phone?: string;
    home_phone?: string;
    mobile_phone?: string;
    fax_number?: string;
    address?: string;
    city?: string;
    state_province?: string;
    zip_postal_code?: string;
    country_region?: string;
    web_page?: string;
    notes?: string;
    attachments?: any;
}

export interface CustomerQueryParameters {
    limit?: number;
    offset?: number;
}

@Injectable()
export class NorthwindService {

    constructor(private http: HttpClient) { }

    getCustomers(query: CustomerQueryParameters = { limit: 10, offset: 0 }): Promise<Customer[]>  {
        const params = new HttpParams()
                .set('limit', (query.limit || 10) + '')
                .set('offset', (query.offset || 0) + '')
        return (
            this.http.get<Customer[]>('/api/customers', { params })
                .toPromise()
        );
    }

    getCustomerDetail(id: number): Promise<Customer> {
        return (
            this.http.get<Customer>(`/api/customer/${id}`)
                .toPromise()
        );
    }
}