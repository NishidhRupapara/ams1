import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-faculty-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminSidebarComponent],
  templateUrl: './faculty-edit.html'
})
export class FacultyEditComponent implements OnInit {
  id: string | null = null;
  loading: boolean = true;
  
  // ✅ Kept as 'faculty' to prevent HTML template errors
  faculty: any = {}; 

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private http: HttpClient, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) this.fetchFaculty();
  }

  fetchFaculty() {
    this.http.get(`${CONFIG.API_URL}/Faculty/profile/${this.id}`).subscribe({
      next: (data: any) => {
        this.faculty = data;
        // Format ISO dates to YYYY-MM-DD for HTML inputs
        if (this.faculty.doj) this.faculty.doj = this.faculty.doj.split('T')[0];
        if (this.faculty.dob) this.faculty.dob = this.faculty.dob.split('T')[0];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        alert("Faculty not found!");
        this.router.navigate(['/view-faculty']);
      }
    });
  }

  // ✅ Restored the handleUpdate function to do the HTTP PUT (saving the data)
  handleUpdate() {
    this.http.put(`${CONFIG.API_URL}/Faculty/profile/${this.id}`, this.faculty).subscribe({
      next: () => {
        alert("✅ Faculty Updated Successfully!");
        this.router.navigate(['/view-faculty']);
      },
      error: (err) => {
        console.error(err);
        alert("❌ Update failed. Check console for details.");
      }
    });
  }
}
