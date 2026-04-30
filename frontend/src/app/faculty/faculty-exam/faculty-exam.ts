import { CONFIG } from '../../config';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FacultySidebarComponent } from '../faculty-sidebar/faculty-sidebar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-faculty-exam',
  standalone: true,
  imports: [CommonModule, FormsModule, FacultySidebarComponent],
  templateUrl: './faculty-exam.html',
  styleUrls: ['./faculty-exam.css']
})
export class FacultyExamComponent implements OnInit {
  viewMode: 'create' | 'list' | 'success' = 'list';
  creationStep: 1 | 2 | 3 = 1; // 1: Info, 2: Questions, 3: Review
  facultyId: string | null = null;
  feedback = { type: '', msg: '' };
  isLoading: boolean = false;
  selectedFileName: string = '';
  username: string = '';

  departments: any[] = [];
  exams: any[] = [];

  // Form State
  examForm = {
    title: '',
    subject: '',
    department: '',
    durationMinutes: 60,
    examDate: '',
    questions: [] as any[],
    randomCount: 0
  };

  currentQuestion = {
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    marks: 1
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const rawFid = sessionStorage.getItem("sessionFid");
    this.facultyId = rawFid ? rawFid.replace(/['"]/g, '').trim() : null;
    this.username = sessionStorage.getItem("sessionUser") || 'Faculty';
    this.fetchDepartments();
    this.fetchExams();
  }

  fetchDepartments(): void {
    this.http.get<any[]>(`${CONFIG.API_URL}/Departments/Dall`).subscribe(data => this.departments = data);
  }

  fetchExams(): void {
    if (!this.facultyId) return;
    this.http.get<any[]>(`${CONFIG.API_URL}/Exam/faculty/${this.facultyId}`).subscribe(data => {
      this.exams = data;
      this.cdr.detectChanges();
    });
  }

  isExpired(examDate: any, duration: number): boolean {
    if (!examDate) return false;
    const start = new Date(examDate);
    const end = new Date(start.getTime() + duration * 60000);
    return new Date() > end;
  }

  addQuestion(): void {
    if (!this.currentQuestion.questionText || this.currentQuestion.options.some(o => !o)) {
      alert("Please fill all question details.");
      return;
    }
    this.examForm.questions.push({ ...this.currentQuestion, options: [...this.currentQuestion.options] });
    this.currentQuestion = { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, marks: 1 };
  }

  removeQuestion(index: number): void {
    this.examForm.questions.splice(index, 1);
  }

  nextStep(): void {
    if (this.creationStep === 1) {
      if (!this.examForm.title || !this.examForm.subject || !this.examForm.department) {
        alert("Please fill all exam details.");
        return;
      }
    }
    if (this.creationStep < 3) this.creationStep = (this.creationStep + 1) as any;
  }

  prevStep(): void {
    if (this.creationStep > 1) this.creationStep = (this.creationStep - 1) as any;
  }

  onSubmit(): void {
    console.log("OnSubmit called. Current Form State:", {
      title: this.examForm.title,
      subject: this.examForm.subject,
      dept: this.examForm.department,
      date: this.examForm.examDate
    });

    if (!this.examForm.title || !this.examForm.subject || !this.examForm.department || !this.examForm.examDate) {
      const missing = [];
      if (!this.examForm.title) missing.push("Exam Title");
      if (!this.examForm.subject) missing.push("Subject Name");
      if (!this.examForm.department) missing.push("Course/Department");
      if (!this.examForm.examDate) missing.push("Exam Date (Starts At)");
      
      alert("Missing Required Fields: " + missing.join(", "));
      return;
    }

    const payload = {
      FacultyId: this.facultyId,
      Department: this.examForm.department,
      Title: this.examForm.title,
      Subject: this.examForm.subject,
      DurationMinutes: Number(this.examForm.durationMinutes) || 60,
      ExamDate: this.examForm.examDate,
      Questions: this.getProcessedQuestions().map(q => ({
        QuestionText: String(q.questionText),
        Options: q.options.map((opt: any) => String(opt)),
        CorrectOptionIndex: Number(q.correctOptionIndex),
        Marks: Number(q.marks)
      }))
    };

    console.log("Validation passed. Submitting Exam Payload:", payload);
    this.isLoading = true;

    this.http.post(`${CONFIG.API_URL}/Exam/create`, payload).subscribe({
      next: (res: any) => {
        console.log("Exam Created:", res);
        this.isLoading = false;
        this.viewMode = 'success';
        this.fetchExams();
        this.resetForm();
      },
      error: (err) => {
        console.error("Submission Error:", err);
        this.isLoading = false;
        
        let errorDetail = "";
        if (err.error && err.error.errors) {
          errorDetail = "\nValidation Errors:\n" + Object.entries(err.error.errors)
            .map(([key, value]) => `- ${key}: ${value}`)
            .join("\n");
        }
        
        alert("Failed to create exam. " + (err.error?.title || "Bad Request") + errorDetail);
      }
    });
  }

  resetForm(): void {
    this.examForm = { title: '', subject: '', department: '', durationMinutes: 60, examDate: '', questions: [], randomCount: 0 };
    this.creationStep = 1;
  }

  getProcessedQuestions(): any[] {
    let qs = [...this.examForm.questions];
    if (this.examForm.randomCount > 0 && this.examForm.randomCount < qs.length) {
      // Fisher-Yates Shuffle
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]];
      }
      return qs.slice(0, this.examForm.randomCount);
    }
    return qs;
  }

  publishResults(examId: string): void {
    this.http.put(`${CONFIG.API_URL}/Exam/publish/${examId}`, {}).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.fetchExams();
      }
    });
  }

  trackByFn(index: number, item: any): number {
    return index;
  }

  downloadTemplate(): void {
    try {
      console.log("Generating template...");
      const data = [
        {
          QuestionText: 'What is the capital of France?',
          Option1: 'Paris',
          Option2: 'London',
          Option3: 'Berlin',
          Option4: 'Madrid',
          CorrectOptionIndex: 0,
          Marks: 1
        },
        {
          QuestionText: 'Which planet is known as the Red Planet?',
          Option1: 'Earth',
          Option2: 'Mars',
          Option3: 'Jupiter',
          Option4: 'Venus',
          CorrectOptionIndex: 1,
          Marks: 1
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      
      // Attempt to save using file-saver
      try {
        saveAs(blob, 'exam_questions_template.xlsx');
      } catch (saveError) {
        console.warn("file-saver failed, trying manual download", saveError);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exam_questions_template.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      }
      console.log("Template download initiated");
    } catch (err) {
      console.error("Template Generation Error:", err);
      alert("Failed to generate template. Error: " + (err as any).message);
    }
  }

  onFileSelected(event: any): void {
    console.log("File selection event triggered");
    const file = event.target.files[0];
    if (!file) {
      console.warn("No file selected");
      return;
    }

    // Reset the value so the same file can be selected again
    event.target.value = '';

    this.selectedFileName = file.name;
    console.log("Processing file:", this.selectedFileName);
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        console.log("File read successful, parsing data...");
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        console.log("JSON Data extracted:", jsonData.length, "rows");

        if (jsonData.length > 0) {
          const uploadedQuestions = jsonData.map((row, index) => {
            // Flexible mapping to handle various header names
            const qText = row.QuestionText || row.questiontext || row.Question || row.question || row['Question Text'] || Object.values(row)[0];
            const opt1 = row.Option1 || row.option1 || row[1] || '';
            const opt2 = row.Option2 || row.option2 || row[2] || '';
            const opt3 = row.Option3 || row.option3 || row[3] || '';
            const opt4 = row.Option4 || row.option4 || row[4] || '';
            const correctIdx = row.CorrectOptionIndex || row.correctoptionindex || row[5] || 0;
            const marks = row.Marks || row.marks || row[6] || 1;

            return {
              questionText: qText,
              options: [opt1, opt2, opt3, opt4],
              correctOptionIndex: parseInt(correctIdx.toString()) || 0,
              marks: parseInt(marks.toString()) || 1
            };
          });

          // Filter out rows that don't have valid question text
          const validQuestions = uploadedQuestions.filter(q => q.questionText && q.questionText.toString().trim().length > 0);
          
          if (validQuestions.length > 0) {
            this.examForm.questions = [...this.examForm.questions, ...validQuestions];
            console.log("Imported", validQuestions.length, "valid questions");
            alert(`Success! ${validQuestions.length} questions imported.`);
          } else {
            alert("No valid questions found in the file. Please check the template format.");
          }
        } else {
          alert("The file appears to be empty.");
        }
        this.cdr.detectChanges();
      } catch (error) {
        console.error("Critical Import Error:", error);
        alert("Failed to read the file. Please ensure it is a valid Excel or CSV file.");
      }
    };
    reader.onerror = (err) => {
      console.error("FileReader Error:", err);
      alert("Error reading file from disk.");
    };
    reader.readAsArrayBuffer(file);
  }
}

