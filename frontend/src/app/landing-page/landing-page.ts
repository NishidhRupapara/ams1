import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css']
})
export class LandingPageComponent {
  constructor(private router: Router) {}

  roles = [
    {
      id: 'admin',
      title: 'Administrator',
      icon: '🛡️',
      description: 'System oversight, user management, and department coordination.',
      route: '/admin-home',
      color: '#0d6efd'
    },
    {
      id: 'faculty',
      title: 'Faculty Member',
      icon: '👨‍🏫',
      description: 'Manage attendance, share resources, and create examinations.',
      route: '/faculty-home',
      color: '#198754'
    },
    {
      id: 'student',
      title: 'Student Portal',
      icon: '🎓',
      description: 'Access study materials, check attendance, and take exams.',
      route: '/student-home',
      color: '#6f42c1'
    }
  ];

  selectRole(role: any) {
    if (typeof window !== 'undefined') {
      if (role.id === 'admin') {
        localStorage.setItem('adminToken', 'true');
        localStorage.setItem('adminId', '1');
      } else if (role.id === 'faculty') {
        sessionStorage.setItem('sessionFid', '1');
        sessionStorage.setItem('sessionUsername', 'Alan Turing');
      } else if (role.id === 'student') {
        sessionStorage.setItem('sessionStudentId', '1');
        sessionStorage.setItem('sessionStudentName', 'John Doe');
        sessionStorage.setItem('sessionStudentDept', 'Computer Science');
      }
    }
    this.router.navigateByUrl(role.route);
  }
}
