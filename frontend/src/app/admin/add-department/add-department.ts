import { CONFIG } from '../../config';
import { Component, ChangeDetectorRef } from '@angular/core'; // ✅ Added ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-add-department',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './add-department.html' // ✅ Ensure this matches your filename
})
export class AddDepartmentComponent {
  departmentName: string = "";
  imageUrl: string = "";
  imageUrlError: boolean = false;
  message = { type: "", text: "" };

  private apiUrl = `${CONFIG.API_URL}/Departments/AddDepartment`;

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef // ✅ Injecting the detector
  ) {}

  onUrlInput() {
    this.imageUrlError = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match(/image\/*/)) {
        this.message = { type: "danger", text: "Please select a valid image file!" };
        return;
      }
      // Check file size (limit to ~2MB to avoid huge MongoDB docs)
      if (file.size > 2 * 1024 * 1024) {
        this.message = { type: "danger", text: "File is too large! Please select an image under 2MB." };
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result; // Base64 string
        this.imageUrlError = false;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  handleSubmit() {
    if (!this.departmentName.trim()) {
      this.message = { type: "danger", text: "Department Name cannot be empty!" };
      return;
    }

    const body = { 
      DepartmentName: this.departmentName,
      ImageUrl: this.imageUrl
    };

    this.http.post<any>(this.apiUrl, body).subscribe({
      next: (data) => {
        // ✅ Success logic
        this.message = { 
          type: "success", 
          text: data.message || "Department added successfully!" 
        };
        this.departmentName = ""; 
        this.imageUrl = "";
        
        // 🚀 CRITICAL: This forces the alert to show up immediately!
        this.cdr.detectChanges(); 

        // Optional: Hide the message after 3 seconds
        setTimeout(() => {
          this.message = { type: "", text: "" };
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (error) => {
        console.error("Error:", error);
        this.message = { 
          type: "danger", 
          text: error.error?.message || "Server error while adding department" 
        };
        this.cdr.detectChanges(); // 🚀 Force refresh on error too
      }
    });
  }
}
