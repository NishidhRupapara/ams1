import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar';

@Component({
  selector: 'app-exam-marks',
  standalone: true,
  imports: [CommonModule, FormsModule, FacultySidebarComponent],
  templateUrl: './exam-marks.html',
  styleUrls: ['./exam-marks.css']
})
export class ExamMarksComponent implements OnInit {
  facultyId: string | null = null;
  feedback = { type: '', msg: '' };
  isLoading: boolean = false;

  // Exam Details Form
  examDetails = {
    department: '',
    subject: '',
    examType: '',
    totalMarks: 100
  };

  studentsList: any[] = [];
  marksData: any = {}; // Stores marks by student ID

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const rawFid = sessionStorage.getItem("sessionFid");
    this.facultyId = rawFid ? rawFid.replace(/['"]/g, '').trim() : null;
  }

  // ✅ Fetch students when the teacher clicks "Load Class"
  fetchStudents(): void {
    if (!this.examDetails.department) {
      this.feedback = { type: 'warning', msg: 'Please select a department first.' };
      return;
    }

    this.isLoading = true;
    this.http.get<any[]>(`${CONFIG.API_URL}/Faculty/students-by-dept/${this.examDetails.department}`)
      .subscribe({
        next: (data) => {
          this.studentsList = data;
          this.marksData = {}; // Clear previous marks
          this.isLoading = false;
          this.feedback.msg = '';
          this.cdr.detectChanges();
        },
        error: () => {
          this.feedback = { type: 'danger', msg: 'Failed to load students.' };
          this.isLoading = false;
        }
      });
  }

  // ✅ Submit all marks to the database
  submitMarks(): void {
    if (!this.examDetails.subject || !this.examDetails.examType) {
      this.feedback = { type: 'danger', msg: 'Please fill in Subject and Exam Type.' };
      return;
    }

    // Build the payload mapping the C# Model
    const payload = this.studentsList.map(student => ({
      FacultyId: this.facultyId,
      StudentId: student.sid || student.Sid,
      StudentName: `${student.fname || student.Fname} ${student.lname || student.Lname}`,
      Department: this.examDetails.department,
      Subject: this.examDetails.subject,
      ExamType: this.examDetails.examType,
      TotalMarks: this.examDetails.totalMarks,
      MarksObtained: this.marksData[student.sid || student.Sid] || 0 // Default to 0 if left blank
    }));

    this.http.post(`${CONFIG.API_URL}/Faculty/submit-marks`, payload)
      .subscribe({
        next: (res: any) => {
          this.feedback = { type: 'success', msg: res.message };
          this.studentsList = []; // Clear the table after success
          this.examDetails.subject = ''; // Reset form partially
          this.cdr.detectChanges();
        },
        error: () => this.feedback = { type: 'danger', msg: 'Failed to submit marks.' }
      });
  }
}
