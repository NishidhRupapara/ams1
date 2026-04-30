import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-feculty-student',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent],
  templateUrl: './feculty-student.html',
  styleUrls: ['./feculty-student.css']
})
export class FecultyStudentComponent implements OnInit {
  faculties: any[] = [];
  loading: boolean = true;
  selectedFacultyId: string | null = null;
  selectedFacultyName: string = '';
  students: any[] = [];
  studentsLoading: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit() { this.fetchFaculties(); }

  fetchFaculties() {
    this.http.get<any[]>(`${CONFIG.API_URL}/Faculty/all`).subscribe({
      next: (data: any) => {
        this.faculties = Array.isArray(data) ? data : (data?.data || []);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  showStudents(faculty: any) {
    // 🚀 FIX: Use 'id' (ObjectId) or 'fid' (numeric) based on what is available and non-zero
    const targetId = (faculty.fid && faculty.fid !== 0) ? faculty.fid.toString() : (faculty.id || faculty._id || faculty.Id);

    this.zone.run(() => {
      this.selectedFacultyId = targetId;
      const first = faculty.fname || faculty.Fname || '';
      const last = faculty.lname || faculty.Lname || '';
      this.selectedFacultyName = `${first} ${last}`.trim() || 'Unnamed Faculty';

      this.studentsLoading = true;
      this.students = [];
      this.cdr.detectChanges();
    });

    this.http.get<any[]>(`${CONFIG.API_URL}/Student/${targetId}/students`).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.students = Array.isArray(res) ? res : (res as any).data || [];
          console.log(`✅ Success! Found ${this.students.length} students for ID: ${targetId}`);
          this.studentsLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error("❌ API Error:", err);
        this.studentsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack() {
    this.selectedFacultyId = null;
    this.cdr.detectChanges();
  }
}


