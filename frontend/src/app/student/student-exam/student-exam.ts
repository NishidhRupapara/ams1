import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { StudentSidebarComponent } from '../student-sidebar/student-sidebar';

@Component({
  selector: 'app-student-exam',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentSidebarComponent],
  templateUrl: './student-exam.html',
  styleUrls: ['./student-exam.css']
})
export class StudentExamComponent implements OnInit, OnDestroy {
  viewMode: 'available' | 'taking' | 'result' = 'available';
  studentId: string | null = null;
  studentName: string = '';
  department: string = '';
  feedback = { type: '', msg: '' };
  isLoading: boolean = false;

  availableExams: any[] = [];
  currentExam: any = null;
  answers: number[] = [];
  examResult: any = null;
  
  // Timer State
  timeLeft: number = 0; // seconds for current exam
  waitTimer: any;       // timer for starting
  waitDisplay: string = "";
  timerInterval: any;
  displayTime: string = "00:00";

  isExpired(examDate: any, duration: number): boolean {
    if (!examDate) return false;
    const start = new Date(examDate);
    const end = new Date(start.getTime() + duration * 60000);
    return new Date() > end;
  }

  isUpcoming(examDate: any): boolean {
    if (!examDate) return false;
    return new Date() < new Date(examDate);
  }

  getWaitTime(examDate: any): string {
    const diff = new Date(examDate).getTime() - new Date().getTime();
    if (diff <= 0) return "";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.studentId = sessionStorage.getItem("sessionStudentId");
    this.studentName = sessionStorage.getItem("sessionStudentName") || 'Student';
    this.department = sessionStorage.getItem("sessionStudentDept") || '';
    this.fetchAvailableExams();
  }

  fetchAvailableExams(): void {
    if (!this.department) return;
    this.http.get<any[]>(`${CONFIG.API_URL}/Exam/available/${this.department}`).subscribe(data => {
      this.availableExams = data;
      this.startWaitTimer();
      this.cdr.detectChanges();
    });
  }

  startWaitTimer(): void {
    if (this.waitTimer) clearInterval(this.waitTimer);
    this.waitTimer = setInterval(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  startExam(examId: string): void {
    const exam = this.availableExams.find(e => e.id === examId || e.Id === examId);
    if (exam && this.isUpcoming(exam.examDate)) {
      alert("This exam has not started yet!");
      return;
    }

    this.isLoading = true;
    this.http.get<any>(`${CONFIG.API_URL}/Exam/details/${examId}`).subscribe({
      next: (data) => {
        this.currentExam = data;
        this.answers = new Array(data.questions.length).fill(-1);
        this.viewMode = 'taking';
        this.isLoading = false;
        
        // Calculate remaining time relative to end time
        const startTime = new Date(data.examDate);
        const endTime = new Date(startTime.getTime() + data.durationMinutes * 60000);
        const remainingSeconds = Math.floor((endTime.getTime() - new Date().getTime()) / 1000);
        
        this.startTimer(remainingSeconds / 60);
        this.cdr.detectChanges();
      },
      error: () => {
        alert("Failed to load exam details.");
        this.isLoading = false;
      }
    });
  }

  startTimer(minutes: number): void {
    this.timeLeft = Math.max(0, Math.floor(minutes * 60));
    this.updateDisplay();
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        alert("Time is up! Submitting your exam automatically.");
        this.submitExam(true);
      }
    }, 1000);
  }

  updateDisplay(): void {
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;
    this.displayTime = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  submitExam(isAuto: boolean = false): void {
    if (this.isExpired(this.currentExam.examDate, this.currentExam.durationMinutes) && !isAuto) {
      alert("Exam time has expired! Your submission cannot be accepted.");
      this.viewMode = 'available';
      return;
    }

    if (!isAuto && !confirm("Are you sure you want to submit?")) return;
    
    if (this.timerInterval) clearInterval(this.timerInterval);

    const payload = {
      ExamId: this.currentExam.id || this.currentExam.Id,
      StudentId: this.studentId,
      StudentName: this.studentName,
      SelectedOptions: this.answers
    };

    this.http.post(`${CONFIG.API_URL}/Exam/attempt`, payload).subscribe({
      next: (res: any) => {
        this.examResult = res;
        this.viewMode = 'result';
        this.fetchAvailableExams();
      },
      error: () => alert("Failed to submit exam")
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.waitTimer) clearInterval(this.waitTimer);
  }
}

