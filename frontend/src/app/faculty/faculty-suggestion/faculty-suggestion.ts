import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar';

@Component({
  selector: 'app-faculty-suggestion',
  standalone: true,
  imports: [CommonModule, FormsModule, FacultySidebarComponent],
  templateUrl: './faculty-suggestion.html',
  styleUrls: ['./faculty-suggestion.css']
})
export class FacultySuggestionComponent implements OnInit {
  // Form Model
  form = { title: '', message: '' };
  
  // State Management
  mySuggestions: any[] = [];
  studentSuggestions: any[] = [];
  isLoading: boolean = false;
  viewMode: 'add' | 'list' = 'list'; // Start on History to see feedback
  
  facultyId: string | null = null;
  feedback = { type: '', msg: '' };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    // Retrieve the Faculty ID from session
    const rawFid = sessionStorage.getItem("sessionFid");
    this.facultyId = rawFid ? rawFid.replace(/['"]/g, '').trim() : null;

    if (!this.facultyId) {
      this.feedback = { type: 'danger', msg: 'Session expired. Please login again.' };
    } else {
      this.fetchMySuggestions(); // Initial load
    }
  }

  // Toggle between Add Form and History List
  switchMode(mode: 'add' | 'list'): void {
    this.viewMode = mode;
    this.feedback.msg = ''; // Clear alerts when switching
    if (mode === 'list') {
      this.fetchMySuggestions();
    }
  }

  // ✅ POST: Connects to your [HttpPost("suggestion")]
  onSubmit(): void {
    if (!this.form.title.trim() || !this.form.message.trim()) return;
    this.isLoading = true;

    const payload = {
      facultyId: this.facultyId,
      title: this.form.title,
      message: this.form.message,
      postedAt: new Date().toISOString(),
      studentId: '0' // Identifying this as a faculty suggestion
    };

    this.http.post(`${CONFIG.API_URL}/Faculty/suggestion`, payload)
      .subscribe({
        next: (res: any) => {
          this.zone.run(() => {
            this.feedback = { type: 'success', msg: res.message || '✅ Submitted Successfully!' };
            this.form = { title: '', message: '' };
            this.isLoading = false;
            this.fetchMySuggestions();
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.zone.run(() => {
            this.feedback = { type: 'danger', msg: '❌ Error: Could not reach the server.' };
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  // ✅ GET: Connects to your [HttpGet("ViewSuggestion")]
  fetchMySuggestions(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${CONFIG.API_URL}/Faculty/ViewSuggestion?Facultyid=${this.facultyId}`)
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            console.log("Teacher received suggestions:", data);
            
            this.mySuggestions = data.filter(s => !s.studentId || s.studentId === '0' || s.studentId === 0);
            this.studentSuggestions = data.filter(s => s.studentId && s.studentId !== '0' && s.studentId !== 0);
            
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            console.error("Fetch error:", err);
            this.isLoading = false;
            this.feedback = { type: 'danger', msg: 'Failed to load suggestions.' };
            this.cdr.detectChanges();
          });
        }
      });
  }
}
