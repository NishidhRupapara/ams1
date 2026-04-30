import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin'; // Make sure path matches
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent],
  templateUrl: './admin-home.html',
  styleUrls: ['./admin-home.css']
})
export class AdminHomeComponent implements OnInit {
  stats = {
    totalStudents: 0,
    totalFaculty: 0,
    totalDepartments: 0,
    recentActivities: [] as any[]
  };
  adminName: string = 'Admin';

  // data arrays that will be populated when user clicks the cards
  facultyData: any[] = [];
  studentData: any[] = [];
  departmentData: any[] = [];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private cdr: ChangeDetectorRef // Inject this to force UI updates
  ) { }
  // simple logout helper used by the button in the template
  logout() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('sessionUsername');
    }
    this.router.navigate(['/admin-login']);
  }
  ngOnInit() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const storedName = sessionStorage.getItem('sessionUsername');
      if (storedName) {
        this.adminName = storedName;
      }
      // Fetch data only after we are sure we are in the browser
      this.fetchDashboardData();
    }
  }

  fetchDashboardData() {
    this.adminService.getDashboardStats().subscribe({
      next: (res: any) => {
        this.stats = {
          totalStudents: res.totalStudents || 0,
          totalFaculty: res.totalFaculty || 0,
          totalDepartments: res.totalDepartments || 0,
          recentActivities: res.recentActivities || []
        };
        // Force Angular to refresh the UI numbers
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Dashboard error:', err)
    });
  }

  // click handlers for the newly added cards
  loadFaculties() {
    this.adminService.getAllFaculty().subscribe({
      next: (res: any) => {
        this.facultyData = res || [];
      },
      error: err => console.error('Failed to load faculty:', err)
    });
  }

  loadStudents() {
    this.adminService.getAllStudents().subscribe({
      next: (res: any) => {
        this.studentData = res || [];
      },
      error: err => console.error('Failed to load students:', err)
    });
  }

  loadDepartments() {
    this.adminService.getAllDepartments().subscribe({
      next: (res: any) => {
        this.departmentData = res || [];
      },
      error: err => console.error('Failed to load departments:', err)
    });
  }
}