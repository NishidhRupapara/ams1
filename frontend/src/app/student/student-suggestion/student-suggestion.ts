import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StudentSidebarComponent } from '../student-sidebar/student-sidebar';

@Component({
  selector: 'app-student-suggestion',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentSidebarComponent],
  templateUrl: './student-suggestion.html',
  styleUrls: ['./student-suggestion.css']
})
export class StudentSuggestionComponent implements OnInit {
  form = { Target: 'Admin', TargetName: 'Admin', FacultyId: '0', Title: '', Message: '', StudentName: 'Student', StudentId: '0' };
  history: any[] = [];
  isLoading = false;
  studentName = 'Student';
  studentId = '0';
  facultyId = '0';
  facultyName = 'My Teacher';
  feedback = { type: '', msg: '' };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.studentName = sessionStorage.getItem("sessionStudentName")?.replace(/['"]/g, '').trim() || 'Student';
    this.studentId = sessionStorage.getItem("sessionStudentId") || '0';
    this.facultyId = sessionStorage.getItem("sessionFacultyId") || '0'; 
    
    // We try to get the faculty name from session too
    this.facultyName = sessionStorage.getItem("sessionFacultyName")?.replace(/['"]/g, '').trim() || 'My Faculty';
    
    this.form.StudentName = this.studentName;
    this.form.StudentId = this.studentId;
    this.loadHistory();
  }

  loadHistory() {
    this.http.get<any[]>(`${CONFIG.API_URL}/Faculty/AllSuggestionFaculty`)
      .subscribe(data => {
         console.log("Suggestions received (raw):", data);
         this.zone.run(() => {
           const myId = (this.studentId || '').toString().trim();
           const myName = (this.studentName || '').toLowerCase().trim();

           this.history = data.filter(s => {
             const sEntries = Object.entries(s);
             
             // 1. Direct ID Match
             const idMatch = sEntries.some(([k, v]) => k.toLowerCase().includes('id') && v && v.toString().trim() === myId);
             
             // 2. Direct Name Match
             const nameMatch = sEntries.some(([k, v]) => k.toLowerCase().includes('name') && v && v.toString().toLowerCase().trim() === myName);

             // 3. Fallback for Old/Anonymous Records (Display if it belongs to "Student" or has no owner)
             const isAnonymous = !sEntries.some(([k, v]) => k.toLowerCase() === 'studentname') || 
                                 sEntries.some(([k, v]) => k.toLowerCase() === 'studentname' && v === 'Student');

             return idMatch || nameMatch || isAnonymous;
           });
           
           console.log("Filtered History (With Fallback):", this.history);
           this.cdr.detectChanges();
         });
      });
  }

  onTargetChange() {
    if (this.form.Target === 'Admin') {
      this.form.TargetName = 'Admin';
      this.form.FacultyId = '0';
    } else {
      this.form.TargetName = this.facultyName;
      this.form.FacultyId = this.facultyId;
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.http.post(`${CONFIG.API_URL}/Student/suggestion`, this.form)
      .subscribe({
        next: (res) => {
          this.zone.run(() => {
            this.feedback = { type: 'success', msg: '✅ Suggestion sent successfully!' };
            this.form.Title = '';
            this.form.Message = '';
            this.isLoading = false;
            this.loadHistory();
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.zone.run(() => {
            this.feedback = { type: 'danger', msg: '❌ Failed to send suggestion.' };
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }
      });
  }
}

