import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar';

@Component({
  selector: 'app-student-center',
  standalone: true,
  imports: [CommonModule, FormsModule, FacultySidebarComponent],
  templateUrl: './student-center.html',
  styleUrls: ['./student-center.css']
})
export class StudentCenterComponent implements OnInit {
  students: any[] = [];
  filteredStudents: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;
  facultyId: string | null = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    const rawFid = sessionStorage.getItem("sessionFid");
    // Clean up the FID string in case it's wrapped in extra quotes
    this.facultyId = rawFid ? rawFid.replace(/['"]/g, '').trim() : null;

    if (this.facultyId) {
      this.fetchMyStudents();
    } else {
      console.warn("No Faculty ID found in session. Redirecting or showing empty.");
      this.isLoading = false;
    }
  }

  fetchMyStudents(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${CONFIG.API_URL}/Student/${this.facultyId}/students`)
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            // 🚀 DATA MAPPING: Converts mixed casing from DB into standard lowercase keys for the HTML
            this.students = data.map(s => ({
              sid: s.sid || s.Sid,
              fname: s.fname || s.Fname,
              mname: s.mname || s.Mname || '',
              lname: s.lname || s.Lname,
              email: s.email_Id || s.Email_Id,
              mobile: s.mo_Number || s.Mo_Number,
              parentName: s.parentName || s.ParentName || 'N/A',
              parentMobile: s.parentMobile || s.ParentMobile || 'N/A',
              department: s.department || s.Department
            }));
            this.filteredStudents = [...this.students];
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            console.error("Error fetching students:", err);
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredStudents = [...this.students];
    } else {
      this.filteredStudents = this.students.filter(s => {
        const fullName = `${s.fname} ${s.mname} ${s.lname}`.toLowerCase();
        return (
          fullName.includes(term) ||
          s.sid?.toString().includes(term) ||
          s.email?.toLowerCase().includes(term) ||
          s.mobile?.includes(term) ||
          s.department?.toLowerCase().includes(term)
        );
      });
    }
    this.cdr.detectChanges();
  }
}

