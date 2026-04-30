import { CONFIG } from '../../config';
import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar';

@Component({
  selector: 'app-faculty-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FacultySidebarComponent],
  templateUrl: './faculty-home.html',
  styleUrls: ['./faculty-home.css']
})
export class FacultyHomeComponent implements OnInit, OnDestroy {
  stats: any = {
    totalStudents: 0,
    totalFaculty: 0,
    totalDepartments: 0,
    recentActivities: []
  };
  loading: boolean = true;
  username: string | null = '';
  private refreshInterval: any;

  constructor(private http: HttpClient, private router: Router, private zone: NgZone, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // 1. Get user session data
    this.username = sessionStorage.getItem("sessionUsername")?.replace(/['"]/g, '').trim() || null;
    const rawFid = sessionStorage.getItem("sessionFid");
    const fid = rawFid ? rawFid.replace(/['"]/g, '').trim() : null;

    if (!fid) {
      this.router.navigate(['/faculty-login']);
      return;
    }

    // 2. Initial Fetch
    this.fetchDashboardStats();

    // 3. Set refresh interval
    this.refreshInterval = setInterval(() => {
      this.fetchDashboardStats();
    }, 10000); // 10 seconds is enough
  }

  // ✅ Properly clean up the timer to avoid background performance issues
  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  fetchDashboardStats(): void {
    this.http.get<any>(`${CONFIG.API_URL}/Dashboard/stats`).subscribe({
      next: (data) => {
        this.zone.run(() => {
          // Map data from C# backend with case-insensitive fallback
          this.stats = {
            totalStudents: data.totalStudents ?? data.TotalStudents ?? 0,
            totalFaculty: data.totalFaculty ?? data.TotalFaculty ?? 0,
            totalDepartments: data.totalDepartments ?? data.TotalDepartments ?? 0,
            recentActivities: data.recentActivities ?? data.RecentActivities ?? []
          };
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          console.error("Dashboard Stats Fetch Error:", err);
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  handleLogout(): void {
    sessionStorage.clear();
    this.router.navigate(['/faculty-login']);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

