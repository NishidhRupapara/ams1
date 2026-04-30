import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';
import { CONFIG } from '../../config';

@Component({
  selector: 'app-view-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  templateUrl: './view-attendance.html',
  styleUrls: ['./view-attendance.css']
})
export class ViewAttendanceComponent implements OnInit {
  attendanceRecords: any[] = [];
  filteredRecords: any[] = [];
  isLoading: boolean = false;
  
  // Search Filters
  searchText: string = '';
  searchCategory: string = 'all'; // all, student, teacher, department, status

  // Edit Modal
  showEditModal: boolean = false;
  recordToEdit: any = null;

  private apiUrl = CONFIG.API_URL;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.fetchAllAttendance();
  }

  fetchAllAttendance(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/Admin/history`).subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.attendanceRecords = data;
          this.filteredRecords = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error("Fetch failed", err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleSearch(): void {
    if (!this.searchText.trim()) {
      this.filteredRecords = this.attendanceRecords;
      return;
    }

    const term = this.searchText.toLowerCase().trim();
    
    this.filteredRecords = this.attendanceRecords.filter(item => {
      const student = (item.fullname || '').toLowerCase();
      const teacher = (item.facultyName || '').toLowerCase();
      const dept = (item.department || '').toLowerCase();
      const status = (item.status || '').toLowerCase();

      if (this.searchCategory === 'student') return student.includes(term);
      if (this.searchCategory === 'teacher') return teacher.includes(term);
      if (this.searchCategory === 'department') return dept.includes(term);
      if (this.searchCategory === 'status') return status.includes(term);
      
      // 'all' search
      return student.includes(term) || teacher.includes(term) || dept.includes(term) || status.includes(term);
    });
  }

  openEditModal(record: any): void {
    this.recordToEdit = { ...record };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.recordToEdit = null;
  }

  updateRecord(): void {
    if (!this.recordToEdit) return;

    const payload = {
      Status: this.recordToEdit.status,
      Remark: this.recordToEdit.remark,
      FacultyId: String(this.recordToEdit.facultyId),
      Date: this.recordToEdit.date ? new Date(this.recordToEdit.date).toISOString() : new Date().toISOString()
    };

    this.http.put(`${this.apiUrl}/Admin/history/${this.recordToEdit.id}`, payload).subscribe({
      next: () => {
        alert("✅ Record updated successfully!");
        this.closeEditModal();
        this.fetchAllAttendance();
      },
      error: (err) => {
        console.error("Update failed", err);
        alert("🚨 Update failed");
      }
    });
  }

  deleteRecord(recordId: string): void {
    if (confirm("⚠️ Delete this record?")) {
      this.http.delete(`${this.apiUrl}/Admin/history/${recordId}`).subscribe({
        next: () => {
          alert("✅ Deleted!");
          this.fetchAllAttendance();
        },
        error: (err) => console.error("Delete failed", err)
      });
    }
  }
}
