import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { StudentSidebarComponent } from '../student-sidebar/student-sidebar';

@Component({
  selector: 'app-view-results',
  standalone: true,
  imports: [CommonModule, StudentSidebarComponent],
  templateUrl: './view-results.html',
  styleUrls: ['./view-results.css']
})
export class ViewResultsComponent implements OnInit {
  results: any[] = [];
  studentName: string = '';
  isLoading: boolean = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.studentName = sessionStorage.getItem("sessionStudentName") || 'Student';
    const sid = sessionStorage.getItem("sessionStudentId");
    if (sid) {
      this.fetchResults(sid);
    }
  }

  fetchResults(sid: string) {
    this.isLoading = true;
    this.http.get<any[]>(`${CONFIG.API_URL}/Exam/results/student/${sid}`)
      .subscribe({
        next: (data) => {
          this.results = data.map(r => ({
            subject: r.subject || r.Subject || r.examType || r.ExamType || 'Unknown',
            marksObtained: r.marksObtained !== undefined ? r.marksObtained : (r.MarksObtained !== undefined ? r.MarksObtained : 0),
            totalMarks: r.totalMarks || r.TotalMarks || 100,
            date: r.dateEntered || r.DateEntered || new Date()
          }));
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error fetching results", err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }
}
