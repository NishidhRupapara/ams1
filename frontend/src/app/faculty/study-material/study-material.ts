import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar';

@Component({
  selector: 'app-study-material',
  standalone: true,
  imports: [CommonModule, FormsModule, FacultySidebarComponent],
  templateUrl: './study-material.html',
  styleUrls: ['./study-material.css']
})
export class StudyMaterialComponent implements OnInit {
  viewMode: 'upload' | 'history' = 'upload';
  facultyId: string | null = null;
  feedback = { type: '', msg: '' };
  isLoading: boolean = false;

  // 🚀 New array to hold departments from DB
  departments: string[] = [];

  form = {
    department: '',
    subject: '',
    title: '',
    materialLink: '',
    fileName: '',
    fileData: ''
  };

  myMaterials: any[] = [];

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
    this.http.get<string[]>(`${CONFIG.API_URL}/Faculty/departments`).subscribe({
      next: (data) => {
        this.departments = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Could not load departments", err)
    });
  }

  switchMode(mode: 'upload' | 'history'): void {
    this.viewMode = mode;
    this.feedback.msg = '';
    if (mode === 'history') {
      this.fetchMyMaterials();
    }
  }

  onSubmit(): void {
    if (!this.form.department || !this.form.subject || !this.form.title || (!this.form.materialLink && !this.form.fileData)) {
      this.feedback = { type: 'danger', msg: 'Please fill all required fields and provide a link or file.' };
      return;
    }

    const payload = {
      FacultyId: this.facultyId,
      Department: this.form.department,
      Subject: this.form.subject,
      Title: this.form.title,
      Link: this.form.materialLink,
      FileName: this.form.fileName,
      FileData: this.form.fileData
    };

    this.http.post(`${CONFIG.API_URL}/Faculty/study-material`, payload)
      .subscribe({
        next: (res: any) => {
          this.feedback = { type: 'success', msg: res.message };
          this.form = { department: '', subject: '', title: '', materialLink: '', fileName: '', fileData: '' };
          this.cdr.detectChanges();
        },
        error: () => this.feedback = { type: 'danger', msg: 'Failed to share material.' }
      });
  }

  downloadFile(material: any): void {
    if (!material.fileData) return;
    const link = document.createElement('a');
    link.href = material.fileData;
    link.download = material.fileName || 'material';
    link.click();
  }

  fetchMyMaterials(): void {
    if (this.facultyId === null || this.facultyId === undefined) {
        this.feedback = { type: 'danger', msg: 'Session error. Please re-login.' };
        return;
    }

    this.isLoading = true;
    const url = `${CONFIG.API_URL}/Faculty/my-materials/${this.facultyId}`;

    this.http.get<any[]>(url).subscribe({
        next: (data) => {
            this.myMaterials = data.map(m => ({
                postedOn: m.postedOn || m.PostedOn,
                department: m.department || m.Department,
                title: m.title || m.Title,
                link: m.link || m.Link,
                fileName: m.fileName || m.FileName,
                fileData: m.fileData || m.FileData
            }));
            this.isLoading = false;
            this.cdr.detectChanges();
        },
        error: (err) => {
            console.error("Fetch Error:", err);
            this.feedback = { type: 'danger', msg: 'Failed to fetch materials.' };
            this.isLoading = false;
            this.cdr.detectChanges();
        }
    });
  }
}

