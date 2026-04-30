import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar'; 

interface AttendanceRecord {
  id: string;
  studentId: string;
  fullname: string;
  status: string;
  remark: string;
  date: string;
}

@Component({
  selector: 'app-attendance-history',
  standalone: true,
  imports: [CommonModule, FormsModule, FacultySidebarComponent], 
  templateUrl: './attendance-history.html',
  styleUrls: ['./attendance-history.css']
})
export class AttendanceHistoryComponent implements OnInit {
  attendanceData: AttendanceRecord[] = [];
  filteredData: AttendanceRecord[] = [];
  
  category: string = '';
  search: string = '';
  message: string = '';
  
  showModal: boolean = false;
  selectedRecord: AttendanceRecord | null = null;
  
  fidsession: string | null = '';
  facultyName: string = 'Faculty';

  // ✅ Added ChangeDetectorRef to fix the click bug!
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const rawFid = sessionStorage.getItem("sessionFid");
    this.fidsession = rawFid ? rawFid.replace(/['"]/g, '').trim() : null;
    this.facultyName = sessionStorage.getItem("sessionUsername") || "Faculty";

    if (!this.fidsession) {
      this.message = "⚠️ Faculty session not found. Please log in.";
      return;
    }
    
    this.fetchHistory();
  }

  fetchHistory(): void {
    this.http.get<AttendanceRecord[]>(`${CONFIG.API_URL}/Student/history/${this.fidsession}`)
      .subscribe({
        next: (res) => {
          this.attendanceData = res;
          this.filteredData = res;
          // ✅ Force UI update instantly when data arrives
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error("API Error:", err);
          this.message = "❌ Failed to fetch data";
          this.cdr.detectChanges(); 
        }
      });
  }

  handleSearch(): void {
    if (!this.search.trim()) {
      this.filteredData = [...this.attendanceData];
      this.message = "";
      this.cdr.detectChanges(); // ✅ Instantly reset table
      return;
    }

    const val = this.search.toLowerCase();
    
    this.filteredData = this.attendanceData.filter((item) => {
      if (this.category === "Fullname") return item.fullname?.toLowerCase().includes(val);
      if (this.category === "Status") return item.status?.toLowerCase().includes(val);
      if (this.category === "Date") return new Date(item.date).toLocaleDateString().includes(val);
      return true;
    });

    this.message = this.filteredData.length > 0 
      ? `Found ${this.filteredData.length} records.` 
      : "No matches found.";
      
    // ✅ Force UI update instantly on search
    this.cdr.detectChanges();
  }

  openEditModal(record: AttendanceRecord): void {
    this.selectedRecord = { ...record };
    this.showModal = true;
    // ✅ Force modal to open instantly on first click
    this.cdr.detectChanges(); 
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRecord = null;
    // ✅ Force modal to close instantly on first click
    this.cdr.detectChanges(); 
  }

  handleUpdate(): void {
    if (!this.selectedRecord) return;

    const payload = {
      Status: this.selectedRecord.status,
      Remark: this.selectedRecord.remark,
      FacultyId: this.fidsession,
      Date: this.selectedRecord.date
    };

    this.http.put(`${CONFIG.API_URL}/Admin/history/${this.selectedRecord.id}`, payload)
      .subscribe({
        next: () => {
          alert("✅ Record updated!");
          this.closeModal();
          this.fetchHistory(); 
        },
        error: (err) => {
          console.error(err);
          alert("Error updating record: " + (err.error?.message || err.message));
          this.cdr.detectChanges();
        }
      });
  }
}
