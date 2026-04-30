import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';
import { CONFIG } from '../../config';

@Component({
  selector: 'app-view-students',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent],
  templateUrl: './view-students.html'
})
export class ViewStudentsComponent implements OnInit {
  students: any[] = [];
  isLoading: boolean = true;
  private apiUrl = `${CONFIG.API_URL}/Student`;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private zone: NgZone // 🚀 Fixes the loading delay bug
  ) {}

  ngOnInit() {
    this.fetchStudents();
  }

  fetchStudents() {
    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/all`).subscribe({
      next: (data) => {
        this.zone.run(() => {
          // 🚀 Safely extract the array whether it's wrapped in { data: [] } or not
          this.students = Array.isArray(data) ? data : (data?.data || data?.students || []);
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          console.error('Error fetching students:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  deleteStudent(id: string) {
    if (!id || id === '0') {
      alert("Error: Cannot delete. Invalid Database ID.");
      return;
    }

    if (window.confirm('⚠️ Are you sure you want to permanently delete this student?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.zone.run(() => {
            alert('✅ Student deleted successfully!');
            // 🚀 Filter out the deleted student using _id, id, or studentId
            this.students = this.students.filter(s => (s._id || s.id || s.studentId) !== id);
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            console.error('Error deleting student:', err);
            alert('❌ Failed to delete student.');
          });
        }
      });
    }
  }
}
