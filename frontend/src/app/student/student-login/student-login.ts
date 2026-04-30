import { CONFIG } from '../../config';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-login.html',
  styleUrls: ['./student-login.css']
})
export class StudentLoginComponent {
  loginData = {
    email: '',
    password: ''
  };

  feedback = { type: '', msg: '' };
  isLoading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  onLogin(): void {
    if (!this.loginData.email || !this.loginData.password) {
      this.feedback = { type: 'danger', msg: 'Please enter both Email and Password.' };
      return;
    }

    this.isLoading = true;

    this.http.post(`${CONFIG.API_URL}/Student/login`, this.loginData)
      .subscribe({
        next: (res: any) => {
          // ✅ FIX: C# returns "Sid", "Name", and "Department" (Uppercase)
          // Mapping them correctly to your session keys
          sessionStorage.setItem("sessionStudentId", res.Sid || res.sid);
          sessionStorage.setItem("sessionStudentName", res.Name || res.name);
          sessionStorage.setItem("sessionStudentDept", res.Department || res.department);

          this.feedback = { type: 'success', msg: 'Login successful! Redirecting...' };
          this.isLoading = false;

          setTimeout(() => {
            this.router.navigate(['/student-home']); 
          }, 1000);
        },
        error: (err) => {
          this.feedback = { type: 'danger', msg: '❌ Invalid Email or Password.' };
          this.isLoading = false;
        }
      });
  }
}
