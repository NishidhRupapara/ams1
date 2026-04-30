import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar'; 

interface Student {
  id: number | string;
  name: string;
  status: string;
  remark: string;
}

@Component({
  selector: 'app-take-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FacultySidebarComponent],
  templateUrl: './take-attendance.html', 
  styleUrls: ['./take-attendance.css']   
})
export class TakeAttendanceComponent implements OnInit {
  students: Student[] = [];
  isLoading: boolean = true; 
  
  showModal: boolean = false;
  submittedCount: number = 0;
  facultyId: string | null = null;
  facultyName: string = "User";

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    const rawFid = sessionStorage.getItem("sessionFid");
    this.facultyId = rawFid ? rawFid.replace(/['"]/g, '').trim() : null;
    this.facultyName = sessionStorage.getItem("sessionUsername")?.replace(/['"]/g, '').trim() || "Faculty";

    if (!this.facultyId) {
      this.isLoading = false;
      return;
    }

    this.fetchStudents();
  }

  fetchStudents(): void {
    this.isLoading = true; 
    
    this.http.get<any[]>(`${CONFIG.API_URL}/Student/${this.facultyId}/students`)
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            const studentList = Array.isArray(data) ? data : [];
            
            this.students = studentList.map(s => ({
              id: s.sid || s.Sid || s.id || s.Id || 0,
              name: `${s.fname || s.Fname || ''} ${s.lname || s.Lname || ''}`.trim() || 'Unknown Student',
              status: 'Present',
              remark: ''
            }));
            
            this.isLoading = false; 
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            console.error("Backend Error:", err);
            this.isLoading = false; 
            this.cdr.detectChanges();
          });
        }
      });
  }

  checkAllPresent(): void {
    this.students.forEach(s => s.status = 'Present');
  }

  checkAllAbsent(): void {
    this.students.forEach(s => s.status = 'Absent');
  }

  handleSubmit(): void {
    if (!this.facultyId) {
      alert("Faculty ID missing. Please login again.");
      return;
    }

    const payload = this.students.map(s => ({
      StudentId: s.id.toString(),
      FacultyId: this.facultyId,
      Status: s.status,
      Remark: s.remark,
      Date: new Date().toISOString()
    }));

    this.http.post(`${CONFIG.API_URL}/Student/submit`, payload)
      .subscribe({
        next: () => {
          this.zone.run(() => {
            this.submittedCount = payload.length;
            this.showModal = true; 
            
            this.students.forEach(s => {
              s.status = 'Present';
              s.remark = '';
            });

            this.cdr.detectChanges(); 
          });
        },
        error: (err) => {
          this.zone.run(() => {
            console.error("Submission error:", err);
            alert(err.error?.message || "Failed to submit attendance.");
            this.cdr.detectChanges();
          });
        }
      });
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges(); // ✅ Ensures the modal closes instantly too!
  }

  goToHistory(): void {
    this.router.navigate(['/attendance-history']);
  }
}
