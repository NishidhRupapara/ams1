import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { StudentSidebarComponent } from '../student-sidebar/student-sidebar';

@Component({
  selector: 'app-view-study-material',
  standalone: true,
  imports: [CommonModule, StudentSidebarComponent],
  templateUrl: './view-study-material.html',
  styleUrls: ['./view-study-material.css']
})
export class ViewStudyMaterialComponent implements OnInit {
  materials: any[] = [];
  isLoading = true;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    const dept = sessionStorage.getItem("sessionStudentDept");
    if (dept) {
      this.fetchMaterials(dept);
    } else {
      this.isLoading = false;
    }
  }

  fetchMaterials(dept: string) {
    this.http.get<any[]>(`${CONFIG.API_URL}/Student/materials/${dept}`)
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.materials = data;
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.zone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }
      });
  }
}

