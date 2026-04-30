import { CONFIG } from '../../config';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-materials',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './admin-materials.html',
  styleUrls: ['./admin-materials.css']
})
export class AdminMaterialsComponent implements OnInit {
  materials: any[] = [];
  departments: any[] = [];
  isLoading: boolean = true;
  isPosting: boolean = false;

  newMaterial = {
    title: '',
    subject: '',
    department: '',
    link: '',
    fileName: '',
    fileData: '',
    facultyId: 'Admin'
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchMaterials();
    this.fetchDepartments();
  }

  fetchMaterials(): void {
    this.http.get<any[]>(`${CONFIG.API_URL}/Admin/all-materials`).subscribe({
      next: (data) => {
        this.materials = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  fetchDepartments(): void {
    this.http.get<any[]>(`${CONFIG.API_URL}/Admin/view-departments`).subscribe(data => this.departments = data);
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newMaterial.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.newMaterial.fileData = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onPostMaterial(): void {
    if (!this.newMaterial.title || (!this.newMaterial.link && !this.newMaterial.fileData) || !this.newMaterial.department) {
      alert("Please fill required fields and provide either a link or a file.");
      return;
    }

    this.isPosting = true;
    this.http.post(`${CONFIG.API_URL}/Admin/post-material`, this.newMaterial).subscribe({
      next: () => {
        alert("Material posted successfully!");
        this.newMaterial = { title: '', subject: '', department: '', link: '', fileName: '', fileData: '', facultyId: 'Admin' };
        this.isPosting = false;
        this.fetchMaterials();
      },
      error: () => {
        alert("Failed to post material.");
        this.isPosting = false;
      }
    });
  }

  downloadFile(material: any): void {
    if (!material.fileData) return;
    const link = document.createElement('a');
    link.href = material.fileData;
    link.download = material.fileName || 'material';
    link.click();
  }

  deleteMaterial(id: string): void {
    if (confirm("Are you sure you want to delete this study material?")) {
      this.http.delete(`${CONFIG.API_URL}/Admin/material/${id}`).subscribe({
        next: () => {
          this.materials = this.materials.filter(m => m.id !== id);
          alert("Material deleted successfully!");
        },
        error: () => alert("Failed to delete material.")
      });
    }
  }
}

