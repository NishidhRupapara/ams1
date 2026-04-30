import { CONFIG } from '../../config';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-faculty-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './faculty-login.html',
  styleUrls: ['./faculty-login.css']
})
export class FacultyLoginComponent {
  form = { Email: '', Password: '' };
  error = '';
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

  handleSubmit(): void {
    this.loading = true;
    this.error = '';

    this.http.post<any>(`${CONFIG.API_URL}/Faculty/login`, this.form).subscribe({
      next: (res) => {
        // 🚀 THE FIX: Prefer the MongoDB string ObjectId since 'fid' could be 0
        const fId = res.id || res.Id || res.fid || res.Fid;

        if (fId !== undefined && fId !== null) {
          sessionStorage.setItem("sessionFid", fId.toString());
          sessionStorage.setItem("sessionUsername", res.username || res.Username || 'Faculty');

          console.log("Login Successful! Redirecting...");

          // Force navigation to the home page
          this.router.navigateByUrl('/faculty-home');
        } else {
          this.loading = false;
          this.error = "User found, but ID is invalid.";
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = "Invalid Credentials.";
        console.error("Login failed", err);
      }
    });
  }
}

