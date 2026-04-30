import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent],
  templateUrl: './student-detail.html'
})
export class StudentDetailComponent implements OnInit {
  student: any = null;
  isLoading: boolean = true; // Added loading state

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef // Injected Change Detector
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchStudentDetails(id);
    } else {
      this.isLoading = false;
    }
  }

  fetchStudentDetails(id: string) {
    this.isLoading = true;
    this.http.get(`${CONFIG.API_URL}/Student/${id}`).subscribe({
      next: (data) => {
        this.student = data;
        this.isLoading = false;
        this.cdr.detectChanges(); // Force UI update after data arrives
      },
      error: (err) => {
        console.error("Error loading student:", err);
        alert("Error loading student details");
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}

