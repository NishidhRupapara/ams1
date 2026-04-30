import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CONFIG } from '../../config';

@Component({
  selector: 'app-student-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-registration.html',
  styleUrls: ['./student-registration.css']
})
export class StudentRegistrationComponent implements OnInit {
  form = {
    Department: '',
    Faculty_Id: '',
    Fname: '',
    Mname: '',
    Lname: '',
    Gender: '',
    DOB: '',
    DOA: '',
    Email_Id: '',
    Mo_Number: '',
    Address: '',
    ParentName: '',
    ParentMobile: '',
    ParentEmail: '',
    Password: '',
    ConfirmPassword: ''
  };

  faculties: any[] = [];
  departments: any[] = []; // ✅ Added to store DB departments
  feedback = { type: '', msg: '' };
  isLoading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadFaculties();
    this.loadDepartments(); // ✅ Load departments from DB on startup
  }

  loadDepartments(): void {
    // This calls your Admin Controller to get the real departments
    this.http.get<any[]>(`${CONFIG.API_URL}/Admin/view-departments`)
      .subscribe({
        next: (data) => {
          this.departments = data;
        },
        error: (err) => {
          console.error("Could not load departments", err);
        }
      });
  }

  loadFaculties(): void {
    this.http.get<any[]>(`${CONFIG.API_URL}/Faculty/all`)
      .subscribe({
        next: (data) => {
          this.faculties = data;
        },
        error: (err) => {
          console.error("Could not load faculties", err);
        }
      });
  }

 // src/app/student/student-registration/student-registration.ts

onSubmit(): void {
  // Check that all required fields are present
  if (!this.form.Fname || !this.form.Email_Id || !this.form.Password) {
    this.feedback = { type: 'danger', msg: 'Please fill all required fields.' };
    return;
  }

  this.isLoading = true;

  // Use the local API URL (Ensure this port matches your backend)
  const apiUrl = `${CONFIG.API_URL}/Student/register`;

  this.http.post(apiUrl, this.form).subscribe({
    next: (res: any) => {
      // res.student.sid comes from the 'register' endpoint we added to StudentController
      alert(`✅ Registration Successful! Your Roll Number is: ${res.student.Sid}`);
      this.isLoading = false;
      this.router.navigate(['/student-login']);
    },
    error: (err) => {
      console.error("Database connection error:", err);
      this.feedback = { type: 'danger', msg: '❌ Could not connect to the database.' };
      this.isLoading = false;
    }
  });
}
}