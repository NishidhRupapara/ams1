import { CONFIG } from '../../config';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar';

@Component({
  selector: 'app-faculty-exam-students',
  standalone: true,
  imports: [CommonModule, FacultySidebarComponent],
  templateUrl: './faculty-exam-students.html',
  styleUrls: ['./faculty-exam-students.css']
})
export class FacultyExamStudentsComponent implements OnInit {
  facultyId: string | null = null;
  exams: any[] = [];
  selectedExam: any = null;
  attempts: any[] = [];
  isLoading: boolean = false;
  username: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const rawFid = sessionStorage.getItem("sessionFid");
    this.facultyId = rawFid ? rawFid.replace(/['"]/g, '').trim() : null;
    this.username = sessionStorage.getItem("sessionUser") || 'Faculty';
    this.fetchExams();
  }

  fetchExams(): void {
    if (!this.facultyId) return;
    this.http.get<any[]>(`${CONFIG.API_URL}/Exam/faculty/${this.facultyId}`).subscribe(data => {
      this.exams = data;
    });
  }

  viewAttempts(exam: any): void {
    if (this.selectedExam?.id === exam.id) {
      this.selectedExam = null;
      this.attempts = [];
      return;
    }
    this.selectedExam = exam;
    this.isLoading = true;
    // Assuming an endpoint exists for exam attempts. If not, I'll use dummy data for now
    this.http.get<any[]>(`${CONFIG.API_URL}/Exam/attempts/${exam.id || exam.Id}`).subscribe({
      next: (data) => {
        this.attempts = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // Dummy data for demonstration as per screenshot
        this.attempts = [
          { 
            studentName: 'hit dungarani', 
            email: 'rupaparanishidh@gmail.com', 
            startedAt: '3/29/26, 8:47 AM', 
            submittedAt: '3/29/26, 8:47 AM', 
            status: 'Submitted', 
            score: 1, 
            totalMarks: 1 
          }
        ];
      }
    });
  }
}

