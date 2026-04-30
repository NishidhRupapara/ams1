import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';
import { CONFIG } from '../../config';

@Component({
  selector: 'app-view-faculty',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  templateUrl: './view-faculty.html',
  styleUrls: ['./view-faculty.css']
})
export class ViewFacultyComponent implements OnInit {
  faculties: any[] = [];
  loading: boolean = true;

  private apiUrl = `${CONFIG.API_URL}/Faculty`;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.fetchFaculties();
  }

  fetchFaculties() {
    this.loading = true;
    this.http.get<any>(`${this.apiUrl}/all`).subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.faculties = Array.isArray(data) ? data : (data?.data || []);
          console.log("✅ RAW DATA FROM API:", this.faculties);
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          console.error("❌ API Error:", err);
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // Helper: Get ID safely
  private getId(f: any): string {
    return f.id || f._id || f.Id || f.ID || '';
  }

  // 🚀 BULLETPROOF NAME CHECKER
  getFullName(f: any): string {
    if (!f) return 'N/A';

    // Checks literally every combination we've seen in your screenshots
    const first = f.FirstName || f.firstName || f.fname || f.Name || f.name || '';
    const last = f.LastName || f.lastName || f.lname || '';

    const fullName = `${first} ${last}`.trim();
    return fullName !== '' ? fullName : 'N/A';
  }

  // 🚀 BULLETPROOF DATE CHECKER
  getDoj(f: any): any {
    if (!f) return null;

    // Checks every date format
    const doj = f.DateOfJoining || f.dateOfJoining || f.DOJ || f.doj || '';

    if (doj.trim() === '') return null;
    return doj;
  }

  handleView(faculty: any) {
    const id = this.getId(faculty);
    if (id) this.router.navigate(['/faculty/view', id]);
  }

  handleEdit(faculty: any) {
    const id = this.getId(faculty);
    if (id) this.router.navigate(['/faculty/edit', id]);
  }

  handleDelete(faculty: any) {
    const id = this.getId(faculty);
    if (!id) return;

    if (confirm("⚠️ Are you sure you want to delete this faculty member?")) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.zone.run(() => {
            this.faculties = this.faculties.filter(f => this.getId(f) !== id);
            this.cdr.detectChanges();
          });
        },
        error: (err) => alert("❌ Delete failed: " + err.message)
      });
    }
  }
}
