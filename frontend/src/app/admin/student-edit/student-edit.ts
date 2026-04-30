import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-student-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  templateUrl: './student-edit.html',
  styleUrls: ['./student-edit.css']
})
export class StudentEditComponent implements OnInit {
  studentId: string = '';
  isSaving: boolean = false;
  isLoading: boolean = true;

  // Data for Dropdowns
  departments: any[] = [];
  faculties: any[] = [];
  filteredFaculties: any[] = [];

  student: any = {
    fname: '', mname: '', lname: '',
    department: '', faculty_Id: '',
    gender: '', dob: '', doa: '',
    email_Id: '', mo_Number: '', address: '',
    parentName: '', parentMobile: '', parentEmail: ''
  };

  private baseUrl = `${CONFIG.API_URL}`;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('id') || '';

    // Load helper data first, then student data
    this.loadDropdowns();
    if (this.studentId) {
      this.fetchStudentData();
    }
  }

  loadDropdowns() {
    // Load Departments
    this.http.get<any[]>(`${this.baseUrl}/Departments/Dall`).subscribe(data => {
      this.departments = data;
    });

    // Load Faculties
    this.http.get<any[]>(`${this.baseUrl}/Faculty/all`).subscribe(data => {
      this.faculties = data;
      this.filterFaculties(); // Filter if department is already loaded
    });
  }

  fetchStudentData() {
    this.isLoading = true;
    this.http.get(`${this.baseUrl}/Student/${this.studentId}`).subscribe({
      next: (data: any) => {
        // Map backend keys to frontend model safely
        this.student = {
          ...data,
          fname: data.Fname || data.fname,
          mname: data.Mname || data.mname,
          lname: data.Lname || data.lname,
          department: data.Department || data.department,
          faculty_Id: data.Faculty_Id || data.faculty_Id,
          email_Id: data.Email_Id || data.email_Id,
          mo_Number: data.Mo_Number || data.mo_Number,
          dob: data.DOB || data.dob,
          doa: data.DOA || data.doa,
          address: data.Address || data.address,
          parentName: data.ParentName || data.parentName,
          parentMobile: data.ParentMobile || data.parentMobile,
          parentEmail: data.ParentEmail || data.parentEmail
        };

        // Format dates for HTML <input type="date"> (YYYY-MM-DD)
        if (this.student.dob) this.student.dob = this.student.dob.split('T')[0];
        if (this.student.doa) this.student.doa = this.student.doa.split('T')[0];

        this.filterFaculties();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error loading student:", err);
        this.isLoading = false;
      }
    });
  }

  filterFaculties() {
    if (!this.student.department) {
      this.filteredFaculties = [];
      return;
    }
    const dept = this.student.department.toLowerCase().trim();
    this.filteredFaculties = this.faculties.filter(f =>
      (f.Department || f.department || "").toLowerCase().trim() === dept
    );
  }

  onDepartmentChange() {
    this.student.faculty_Id = ""; // Reset faculty when department changes
    this.filterFaculties();
  }

  updateStudent() {
    this.isSaving = true;

    // Build Payload matching C# Student Model EXACTLY
    const payload = {
      ...this.student,
      // Ensure specific keys match backend [BsonElement] names
      Fname: this.student.fname,
      Mname: this.student.mname,
      Lname: this.student.lname,
      Department: this.student.department,
      Faculty_Id: this.student.faculty_Id,
      Email_Id: this.student.email_Id,
      Mo_Number: this.student.mo_Number,
      ImageUrl: this.student.imageUrl,
      Address: this.student.address,
      ParentName: this.student.parentName,
      ParentMobile: this.student.parentMobile,
      ParentEmail: this.student.parentEmail,
      // Safely map empty strings to null to prevent ASP.NET Model validation 400 Bad Requests
      DOB: this.student.dob === "" ? null : this.student.dob, 
      DOA: this.student.doa === "" ? null : this.student.doa
    };

    this.http.put(`${this.baseUrl}/Student/${this.studentId}`, payload).subscribe({
      next: () => {
        alert("✅ Student Record Updated Successfully!");
        this.router.navigate(['/student/view', this.studentId]);
      },
      error: (err) => {
        this.isSaving = false;
        console.error("Update Error:", err);
        alert("❌ Failed to update. Check backend connection.");
      }
    });
  }
}

