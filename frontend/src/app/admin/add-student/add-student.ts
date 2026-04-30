import { CONFIG } from '../../config';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent, RouterModule],
  templateUrl: './add-student.html',
  styleUrls: ['./add-student.css']
})
export class AddStudentComponent implements OnInit {
  faculties: any[] = [];
  departments: any[] = [];
  filteredFaculties: any[] = [];
  message: string = "";
  isError: boolean = false;

  form = {
    Faculty_Id: "",
    Department: "",
    Fname: "", Mname: "", Lname: "", Gender: "",
    DOB: "", DOA: "", Email_Id: "", Mo_Number: "",
    Address: "", ParentName: "", ParentMobile: "", ParentEmail: "",
    Password: "", ConfirmPassword: "", ImageUrl: ""
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchFaculties();
    this.fetchDepartments();
  }

  fetchFaculties() {
    this.http.get<any[]>(`${CONFIG.API_URL}/Faculty/all`).subscribe({
      next: (data) => {
        this.faculties = Array.isArray(data) ? data : (data as any)?.data || [];
      },
      error: (err) => console.error("Error fetching faculties:", err)
    });
  }

  fetchDepartments() {
    this.http.get<any[]>(`${CONFIG.API_URL}/Departments/Dall`).subscribe({
      next: (data) => {
        this.departments = Array.isArray(data) ? data : (data as any)?.data || [];
        console.log("✅ Departments loaded:", this.departments);
      },
      error: (err) => console.error("❌ Error fetching departments:", err)
    });
  }

  onDepartmentChange() {
    this.form.Faculty_Id = "";
    this.filteredFaculties = this.faculties.filter(f =>
      f.Department === this.form.Department ||
      f.department === this.form.Department ||
      f.DepartmentName === this.form.Department ||
      f.departmentName === this.form.Department
    );
  }

  handleSubmit() {
    this.message = "";
    this.isError = false;

    if (this.form.Password !== this.form.ConfirmPassword) {
      this.message = "❌ Passwords do not match!";
      this.isError = true;
      return;
    }

    const payload = { ...this.form };
    if (payload.DOB === "") (payload as any).DOB = null;
    if (payload.DOA === "") (payload as any).DOA = null;

    this.http.post(`${CONFIG.API_URL}/Student/add`, payload).subscribe({
      next: (res: any) => {
        this.message = "✅ Student added successfully!";
        this.resetForm();
      },
      error: (err) => {
        this.message = `❌ Failed: ${err.error?.message || "Server error"}`;
        this.isError = true;
      }
    });
  }

  resetForm() {
    this.form = {
      Faculty_Id: "", Department: "", Fname: "", Mname: "", Lname: "", Gender: "",
      DOB: "", DOA: "", Email_Id: "", Mo_Number: "", Address: "",
      ParentName: "", ParentMobile: "", ParentEmail: "",
      Password: "", ConfirmPassword: "", ImageUrl: ""
    };
    this.filteredFaculties = [];
  }
}

