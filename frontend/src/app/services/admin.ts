import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CONFIG } from '../config';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = CONFIG.API_URL;

  constructor(private http: HttpClient) { }

  // 1. Admin Login API
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Admin/login`, data);
  }

  // 2. Dashboard Stats API
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Dashboard/stats`);
  }

  // 3. Fetch all faculty records from database
  getAllFaculty(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Faculty/all`);
  }

  // 4. Fetch all student records from database
  getAllStudents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Student/all`);
  }

  // 5. Fetch all department records from database
  getAllDepartments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Departments/Dall`);
  }
}