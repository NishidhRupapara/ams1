import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-suggestion',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent],
  templateUrl: './suggestion.html',
  styleUrls: ['./suggestion.css']
})
export class SuggestionComponent implements OnInit {
  suggestions: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  showModal: boolean = false;
  selectedSuggestion: any = null;

  // ✅ FIXED: Changed "Faculty" to "Admin" to match your Backend Controller
  private apiUrl = `${CONFIG.API_URL}/Admin`;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchSuggestions();
  }

  fetchSuggestions(): void {
    // ✅ This will now call `${CONFIG.API_URL}/Admin/AllSuggestionFaculty`
    this.http.get<any[]>(`${this.apiUrl}/AllSuggestionFaculty`).subscribe({
      next: (data) => {
        this.suggestions = data;
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.error = "❌ Error fetching suggestions: " + err.message;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleRespond(suggestion: any): void {
    this.selectedSuggestion = { ...suggestion }; 
    this.showModal = true;
    this.cdr.detectChanges();
  }

  handleUpdate(): void {
    // ✅ This will now call `${CONFIG.API_URL}/Admin/suggestion/{id}`
    this.http.put(
      `${this.apiUrl}/suggestion/${this.selectedSuggestion.suggestionId}`,
      this.selectedSuggestion
    ).subscribe({
      next: () => {
        // Update the list locally so the UI updates instantly
        this.suggestions = this.suggestions.map(s =>
          s.suggestionId === this.selectedSuggestion.suggestionId ? { ...this.selectedSuggestion } : s
        );

        this.showModal = false;
        alert("✅ Suggestion updated and saved to Database!");
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert("❌ Error updating suggestion: " + (err.error?.message || err.message));
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.detectChanges();
  }
}
