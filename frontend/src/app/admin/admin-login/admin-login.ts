import { CONFIG } from '../../config';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css']
})
export class AdminLoginComponent {
  // Matches the exact fields expected by your C# AdminLogin model
  credentials = {
    Username: '',
    Password: ''
  };

  isLoading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    if (!this.credentials.Username || !this.credentials.Password) {
      alert("⚠️ Please enter both Username and Password.");
      return;
    }

    this.isLoading = true;

    this.http.post(`${CONFIG.API_URL}/Admin/login`, this.credentials).subscribe({
      next: (response: any) => {
        // 1. Store auth data in localStorage
        localStorage.setItem('adminToken', 'true');
        
        if (response.Aid) {
          localStorage.setItem('adminId', response.Aid);
        }

        // 2. Navigate to the admin dashboard
        this.router.navigate(['/admin-home']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Login Error:", err);
        
        if (err.status === 401) {
          alert("❌ Unauthorized: Incorrect Username or Password.");
        } else {
          alert("🚨 Login Failed: Cannot connect to the server.");
        }
      }
    });
  }
}

