import { CONFIG } from '../../config';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-exam',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent],
  templateUrl: './admin-exam.html',
  styleUrls: ['./admin-exam.css']
})
export class AdminExamComponent implements OnInit {
  exams: any[] = [];
  isLoading: boolean = true;
  selectedAttempts: any[] = [];
  showModal: boolean = false;
  selectedExamTitle: string = '';

  isExpired(examDate: any, duration: number): boolean {
    if (!examDate) return false;
    const start = new Date(examDate);
    const end = new Date(start.getTime() + duration * 60000);
    return new Date() > end;
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchExams();
  }

  fetchExams(): void {
    this.http.get<any[]>(`${CONFIG.API_URL}/Exam/all`).subscribe({
      next: (data) => {
        this.exams = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error fetching exams", err);
        this.isLoading = false;
      }
    });
  }

  deleteExam(id: string): void {
    if (confirm("Are you sure you want to delete this exam?")) {
      this.http.delete(`${CONFIG.API_URL}/Exam/${id}`).subscribe({
        next: () => {
          this.exams = this.exams.filter(e => (e.id || e.Id) !== id);
          alert("Exam deleted successfully!");
        },
        error: () => alert("Failed to delete exam.")
      });
    }
  }

  viewResults(exam: any): void {
    const id = exam.id || exam.Id;
    this.selectedExamTitle = exam.title;
    this.http.get<any[]>(`${CONFIG.API_URL}/Exam/attempts/${id}`).subscribe({
      next: (data) => {
        this.selectedAttempts = data.map(a => ({
          studentName: a.studentName || a.StudentName,
          studentId: a.studentId || a.StudentId,
          score: a.score !== undefined ? a.score : a.Score,
          totalMarks: a.totalMarks || a.TotalMarks || 100
        }));
        this.showModal = true;
      },
      error: () => alert("Failed to fetch exam results.")
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedAttempts = [];
  }
}

