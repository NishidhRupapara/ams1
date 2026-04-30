import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-attendance-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent],
  templateUrl: './attendance-detail.html',
  styleUrls: ['./attendance-detail.css']
})
export class AttendanceDetailComponent implements OnInit {
  record: any = null;
  loading: boolean = true;
  id: string | null = null;

  private apiUrl = `${CONFIG.API_URL}/Admin/history`;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.fetchRecord();
    }
  }

  fetchRecord(): void {
    this.http.get<any>(`${this.apiUrl}/${this.id}`).subscribe({
      next: (data) => {
        this.record = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error loading record:", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  goBack(): void {
    this.zone.run(() => {
      this.router.navigate(['/view-attendance']);
    });
  }
}
