import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-edit-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  templateUrl: './edit-attendance.html',
  styleUrls: ['./edit-attendance.css']
})
export class EditAttendanceComponent implements OnInit {
  id: string | null = null;
  loading: boolean = true;
  isSaving: boolean = false;
  
  // The exact form fields matching your HTML
  form: any = {
    facultyId: '',
    status: 'Present',
    remark: '',
    date: ''
  };

  private apiUrl = `${CONFIG.API_URL}/Admin/history`;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.fetchRecord();
    }
  }

  fetchRecord(): void {
    this.http.get<any>(`${this.apiUrl}/${this.id}`).subscribe({
      next: (data) => {
        // Map the existing data into the form
        this.form = {
          facultyId: data.facultyId || data.FacultyId || '',
          status: data.status || data.Status || 'Present',
          remark: data.remark || data.Remark || '',
          // Ensure date is formatted for the HTML input if you have one
          date: (data.date || data.Date) ? new Date(data.date || data.Date).toISOString().split('T')[0] : ''
        };
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Fetch Error:", err);
        alert("❌ Failed to load record from database.");
      }
    });
  }

  handleSubmit(): void {
    this.isSaving = true;

    // 🧹 THE CLEAN DTO PAYLOAD:
    // This matches the C# AttendanceUpdateDto EXACTLY. No extra fields, no missing fields.
    const payload = {
      Status: this.form.status,
      Remark: this.form.remark,
      FacultyId: this.form.facultyId,
      // Force the date into a strict ISO string so C# DateTime doesn't crash
      Date: this.form.date ? new Date(this.form.date).toISOString() : new Date().toISOString()
    };

    console.log("Sending Payload to C#:", payload);

    this.http.put(`${this.apiUrl}/${this.id}`, payload).subscribe({
      next: () => {
        alert("✅ Attendance record updated successfully!");
        this.router.navigate(['/view-attendance']);
      },
      error: (err) => {
        this.isSaving = false;
        console.error("Backend Error:", err);
        
        let exactError = "Check F12 Console for details.";
        
        // Detailed error extraction
        if (err.error && err.error.errors) {
          exactError = JSON.stringify(err.error.errors, null, 2);
        } else if (err.error && err.error.message) {
          exactError = err.error.message;
        } else if (err.status === 400) {
          exactError = "Data Format Error (400 Bad Request).";
        } else if (err.status === 404) {
          exactError = "Endpoint not found (404).";
        }

        alert(`🚨 UPDATE FAILED:\n\n${exactError}`);
      }
    });
  }
}
