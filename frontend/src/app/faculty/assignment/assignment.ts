import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar';

@Component({
  selector: 'app-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule, FacultySidebarComponent],
  templateUrl: './assignment.html',
  styleUrls: ['./assignment.css']
})
export class AssignmentComponent implements OnInit {
  viewMode: 'post' | 'history' = 'post';
  facultyId: string | null = null;
  feedback = { type: '', msg: '' };
  isLoading: boolean = false;

  form = {
    department: '',
    subject: '',
    title: '',
    description: '',
    dueDate: '',
    referenceLink: '',
    fileName: '',
    fileData: ''
  };

  departments: any[] = [];
  myAssignments: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const rawFid = sessionStorage.getItem("sessionFid");
    this.facultyId = rawFid ? rawFid.replace(/['"]/g, '').trim() : null;
    this.fetchDepartments();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.form.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.form.fileData = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  fetchDepartments(): void {
    this.http.get<any[]>(`${CONFIG.API_URL}/Departments/Dall`)
      .subscribe({
        next: (data) => {
          this.departments = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Error loading departments for assignment POST", err)
      });
  }

  switchMode(mode: 'post' | 'history'): void {
    this.viewMode = mode;
    this.feedback.msg = '';
    if (mode === 'history') {
      this.fetchMyAssignments();
    }
  }

  onSubmit(): void {
    if (!this.form.department || !this.form.subject || !this.form.title || !this.form.dueDate) {
      this.feedback = { type: 'danger', msg: 'Please fill required fields.' };
      return;
    }

    const payload = {
      FacultyId: this.facultyId,
      Department: this.form.department,
      Subject: this.form.subject,
      Title: this.form.title,
      Description: this.form.description,
      Deadline: this.form.dueDate,
      ReferenceLink: this.form.referenceLink,
      FileName: this.form.fileName,
      FileData: this.form.fileData
    };

    this.http.post(`${CONFIG.API_URL}/Faculty/post-assignment`, payload)
      .subscribe({
        next: (res: any) => {
          this.feedback = { type: 'success', msg: res.message };
          this.form = { department: '', subject: '', title: '', description: '', dueDate: '', referenceLink: '', fileName: '', fileData: '' }; 
          this.cdr.detectChanges();
        },
        error: () => this.feedback = { type: 'danger', msg: 'Failed to post assignment.' }
      });
  }

  downloadFile(assignment: any): void {
    if (!assignment.fileData && !assignment.FileData) return;
    const link = document.createElement('a');
    link.href = assignment.fileData || assignment.FileData;
    link.download = assignment.fileName || assignment.FileName || 'assignment';
    link.click();
  }

  fetchMyAssignments(): void {
    this.isLoading = true;
    this.http.get<any[]>(`${CONFIG.API_URL}/Faculty/my-assignments/${this.facultyId}`)
      .subscribe({
        next: (data) => {
          this.myAssignments = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.feedback = { type: 'danger', msg: 'Failed to load history.' };
          this.isLoading = false;
        }
      });
  }
}
