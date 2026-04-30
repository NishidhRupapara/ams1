import { CONFIG } from '../../config';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-faculty-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './faculty-registration.html',
  styleUrls: ['./faculty-registration.css']
})
export class FacultyRegistrationComponent implements OnInit {
  form: any = {
    fname: "", mname: "", lname: "", gender: "", dob: "",
    username: "", password: "", cpassword: "", email: "",
    mobile: "", department: "", doj: "", address: "",
    education: "", altEmail: "", emergencyPhone: "",
  };

  departments: any[] = [];
  error: string = "";
  loading: boolean = false;
  facultyId: any = null;

  private baseUrl = `${CONFIG.API_URL}`;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchDepartments();
  }

  fetchDepartments(): void {
    this.http.get<any[]>(`${this.baseUrl}/Departments/Dall`).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.departments = data;
        }
      },
      error: (err) => console.error("Error fetching departments:", err)
    });
  }

  // Auto-generate username logic
  onNameChange(): void {
    this.form.username = (this.form.fname.trim() + this.form.lname.trim()).toLowerCase();
  }

 // faculty-registration.ts
handleSubmit(): void {
  this.loading = true;
  
  // Connect to api/Faculty/register
  this.http.post<any>(`${CONFIG.API_URL}/Faculty/register`, this.form).subscribe({
    next: (response) => {
      alert(`Registration Successful! Your Faculty ID is: ${response.fid}`);
      this.router.navigate(['/faculty-login']);
    },
    error: (err) => {
      this.loading = false;
      this.error = "Registration failed. Username might be taken.";
    }
  });
}
}
