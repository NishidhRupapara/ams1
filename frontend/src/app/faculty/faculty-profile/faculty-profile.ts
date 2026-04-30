import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core'; // 👈 1. Added ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar';

@Component({
  selector: 'app-faculty-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, FacultySidebarComponent],
  templateUrl: './faculty-profile.html',
  styleUrls: ['./faculty-profile.css']
})
export class FacultyProfileComponent implements OnInit {
  profile: any = null;
  editData: any = {};
  
  loading: boolean = true;
  error: string | null = null;
  editing: boolean = false;

  facultyId: string | null = null;
  facultyName: string = 'User';

  // 👈 2. Injected ChangeDetectorRef into the constructor
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  ngOnInit(): void {
    const storedFid = sessionStorage.getItem("sessionFid");
    const storedName = sessionStorage.getItem("sessionUsername");

    if (storedName) this.facultyName = storedName.replace(/['"]/g, '').trim();
    if (storedFid) this.facultyId = storedFid.replace(/['"]/g, '').trim();

    if (!this.facultyId) {
      this.error = "Faculty not logged in! Please log in again.";
      this.loading = false;
      return;
    }

    this.fetchProfile();
  }

  fetchProfile(): void {
    this.http.get<any>(`${CONFIG.API_URL}/Faculty/profile/${this.facultyId}`)
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.profile = data;
            this.loading = false;
            this.cdr.detectChanges(); 
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.error = "❌ Error fetching profile: " + (err.message || "Server unreachable");
            this.loading = false;
            this.cdr.detectChanges(); 
          });
        }
      });
  }

  openEditModal(): void {
    this.editData = { ...this.profile };
    this.editing = true;
  }

  closeEditModal(): void {
    this.editing = false;
  }

  saveProfile(): void {
    this.http.put(`${CONFIG.API_URL}/Faculty/profile/${this.facultyId}`, this.editData)
      .subscribe({
        next: () => {
          this.profile = { ...this.editData }; 
          this.editing = false;
          this.cdr.detectChanges(); // 👈 Forces the UI to show the newly saved details
          alert("✅ Profile updated successfully!");
        },
        error: (err) => {
          const errMsg = err.error?.message || err.message;
          alert("❌ Failed to update profile: " + errMsg);
        }
      });
  }
}
