import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar';

@Component({
  selector: 'app-student-record',
  standalone: true,
  imports: [CommonModule, FormsModule, FacultySidebarComponent],
  templateUrl: './student-record.html',
  styleUrls: ['./student-record.css']
})
export class StudentRecordComponent implements OnInit {
  attendanceHistory: any[] = [];
  filteredHistory: any[] = [];
  isLoading: boolean = false;
  
  // Filters
  startDate: string = '';
  endDate: string = '';
  searchTerm: string = '';
  facultyId: string | null = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const rawFid = sessionStorage.getItem("sessionFid");
    this.facultyId = rawFid ? rawFid.replace(/['"]/g, '').trim() : null;

    if (this.facultyId) {
      this.fetchAllHistory();
    }
  }

  fetchAllHistory(): void {
    this.isLoading = true;
    // Calling your C# API endpoint for attendance history
    this.http.get<any[]>(`${CONFIG.API_URL}/Student/history/${this.facultyId}`)
      .subscribe({
        next: (data) => {
          this.attendanceHistory = data;
          this.filteredHistory = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Error fetching history:", err);
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    let temp = [...this.attendanceHistory];

    // 1. Filter by Date Range
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate).getTime();
      const end = new Date(this.endDate).getTime();
      temp = temp.filter(item => {
        const recordDate = new Date(item.date).getTime();
        return recordDate >= start && recordDate <= end;
      });
    }

    // 2. Filter by Search (Name or ID)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(item => 
        item.fullname.toLowerCase().includes(term) || 
        item.studentId.toString().includes(term)
      );
    }

    this.filteredHistory = temp;
    this.cdr.detectChanges();
  }

  exportExcel(): void {
    if (this.filteredHistory.length === 0) {
      alert("No data available to export!");
      return;
    }

    const exportData = this.filteredHistory.map(item => ({
      'Date': new Date(item.date).toLocaleDateString(),
      'Roll No': item.studentId,
      'Student Name': item.fullname,
      'Status': item.status,
      'Remark': item.remark || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance_Report');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `Attendance_Report_${new Date().toLocaleDateString()}.xlsx`);
  }
}
