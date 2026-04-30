import { CONFIG } from '../../config';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './admin-leaves.html',
  styleUrls: ['./admin-leaves.css']
})
export class AdminLeavesComponent implements OnInit {
  leaves: any[] = [];
  isLoading: boolean = true;
  selectedLeave: any = null;
  adminRemark: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchLeaves();
  }

  fetchLeaves(): void {
    this.http.get<any[]>(`${CONFIG.API_URL}/Admin/all-leaves`).subscribe({
      next: (data) => {
        this.leaves = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  openDecisionModal(leave: any): void {
    this.selectedLeave = leave;
    this.adminRemark = leave.adminRemark || '';
  }

  updateStatus(status: string): void {
    if (!this.selectedLeave) return;

    const payload = {
      status: status,
      adminRemark: this.adminRemark
    };

    this.http.put(`${CONFIG.API_URL}/Admin/leave/${this.selectedLeave.id}`, payload).subscribe({
      next: () => {
        alert(`Leave ${status} successfully!`);
        this.selectedLeave = null;
        this.fetchLeaves();
      },
      error: () => alert("Failed to update leave status.")
    });
  }
}

