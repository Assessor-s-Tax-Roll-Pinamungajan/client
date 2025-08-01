import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

// Angular core
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatSelectModule,
    MatOptionModule,
    RouterLink,
    NgIf,
    NgClass
  ]
})
export class NavbarComponent {
  isMobileMenuOpen = false;

  constructor(private router: Router) {}

  isActive(path: string): boolean {
    return this.router.url === path; // or use the smarter version from earlier
  }

  logout(): void {
    console.log('User logged out');
  }
}
