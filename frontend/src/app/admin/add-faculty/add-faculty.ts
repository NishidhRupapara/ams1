import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // ✅ Added OnInit and ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
// ✅ Path matches your folder structure: src/app/admin/add-faculty/
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar'; 

@Component({
  selector: 'app-add-faculty',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './add-faculty.html',
  styleUrls: ['./add-faculty.css'] // ✅ Added to prevent potential metadata errors
})
export class AddFacultyComponent implements OnInit {
  formData: any = {
    Fname: "", Mname: "", Lname: "", Gender: "", Dob: "", Doj: "",
    Department: "", Username: "", Password: "", ConfirmPassword: "", Email: "",
    Mobile: "", AltEmail: "", EmergencyPhone: "", Education: "", Address: "", ImageUrl: ""
  };

  departments: any[] = [];
  feedback = { type: "", msg: "" };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.fetchDepartments();
  }

  fetchDepartments() {
    this.http.get<any[]>(`${CONFIG.API_URL}/Departments/Dall`).subscribe({
      next: (res) => {
        this.departments = res;
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error("Department fetch error:", err)
    });
  }

  onNameChange() {
    if (this.formData.Fname && this.formData.Lname) {
      this.formData.Username = `${this.formData.Fname}${this.formData.Lname}`.toLowerCase();
    }
  }

  handleSubmit() {
    if (this.formData.Password !== this.formData.ConfirmPassword) {
      this.feedback = { type: "error", msg: "❌ Passwords do not match!" };
      this.cdr.detectChanges();
      return;
    }
    this.http.post(`${CONFIG.API_URL}/Faculty/register`, this.formData).subscribe({
      next: () => {
        this.feedback = { type: "success", msg: "✅ Faculty Added Successfully!" };
        this.resetForm();
        this.cdr.detectChanges(); 

        setTimeout(() => {
          this.feedback.msg = "";
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        console.error("API Error:", err);
        this.feedback = { type: "error", msg: "❌ Failed to add faculty!" };
        this.cdr.detectChanges();
      }
    });
  }

  resetForm() {
    this.formData = {
      Fname: "", Mname: "", Lname: "", Gender: "", Dob: "", Doj: "",
      Department: "", Username: "", Password: "", ConfirmPassword: "", Email: "",
      Mobile: "", AltEmail: "", EmergencyPhone: "", Education: "", Address: "", ImageUrl: ""
    };
  }
}
