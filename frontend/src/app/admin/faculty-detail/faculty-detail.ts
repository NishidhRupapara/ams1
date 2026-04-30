import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-faculty-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent],
  templateUrl: './faculty-detail.html'
})
export class FacultyDetailComponent implements OnInit {
  id: string | null = null;
  loading: boolean = true;
  faculty: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone // 🚀 Fixes the "blank screen until second click" issue
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');

    // 🚀 SAFETY CHECK: If the ID is completely missing or is literally "0"
    if (!this.id || this.id === '0') {
      alert("⚠️ Error: Missing or Invalid Faculty ID from the database.");
      this.router.navigate(['/view-faculty']);
      return;
    }

    this.fetchFaculty();
  }

  fetchFaculty() {
    this.http.get(`${CONFIG.API_URL}/Faculty/profile/${this.id}`).subscribe({
      next: (data: any) => {
        this.zone.run(() => {
          this.faculty = data;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.zone.run(() => {
          console.error("Fetch Error:", err);
          alert("❌ Faculty record not found in the database.");
          this.router.navigate(['/view-faculty']);
        });
      }
    });
  }
}

