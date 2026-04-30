import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar';

@Component({
  selector: 'app-faculty-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, FacultySidebarComponent],
  templateUrl: './faculty-leave.html',
  styleUrls: ['./faculty-leave.css']
})
export class FacultyLeaveComponent implements OnInit {
  viewMode: 'apply' | 'history' = 'apply';
  
  form = {
    startDate: '',
    endDate: '',
    reason: ''
  };

  myLeaves: any[] = [];
  facultyId: string | null = null;
  feedback = { type: '', msg: '' };
  isLoading: boolean = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const rawFid = sessionStorage.getItem("sessionFid");
    this.facultyId = rawFid ? rawFid.replace(/['"]/g, '').trim() : null;
  }

  switchMode(mode: 'apply' | 'history'): void {
    this.viewMode = mode;
    this.feedback.msg = '';
    if (mode === 'history') {
      this.fetchMyLeaves();
    }
  }

  onSubmit(): void {
    if (!this.form.startDate || !this.form.endDate || !this.form.reason.trim()) {
      this.feedback = { type: 'danger', msg: 'Please fill all fields.' };
      return;
    }

    if (new Date(this.form.endDate) < new Date(this.form.startDate)) {
      this.feedback = { type: 'danger', msg: 'End date cannot be before start date.' };
      return;
    }

    const payload = {
      facultyId: this.facultyId,
      startDate: this.form.startDate,
      endDate: this.form.endDate,
      reason: this.form.reason
    };

    this.http.post(`${CONFIG.API_URL}/Faculty/apply-leave`, payload)
      .subscribe({
        next: (res: any) => {
          this.feedback = { type: 'success', msg: res.message };
          this.form = { startDate: '', endDate: '', reason: '' };
          this.cdr.detectChanges();
        },
        error: () => this.feedback = { type: 'danger', msg: 'Error connecting to server.' }
      });
  }

  fetchMyLeaves(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${CONFIG.API_URL}/Faculty/my-leaves/${this.facultyId}`)
      .subscribe({
        next: (data) => {
          this.myLeaves = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.feedback = { type: 'danger', msg: 'Failed to load leave history.' };
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }
}
