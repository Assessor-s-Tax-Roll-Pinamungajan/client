import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatDialogModule,
    MatSnackBarModule,
    RouterLink,
    NgIf,
    NgClass
  ]
})
export class NavbarComponent {
  isMobileMenuOpen = false;
  private secretClickCount = 0;
  private lastClickAt = 0;
  private clickWindowMs = 1500;

  constructor(private router: Router, private dialog: MatDialog, private http: HttpClient, private snackBar: MatSnackBar) {}

  isActive(path: string): boolean {
    return this.router.url === path; // or use the smarter version from earlier
  }

  logout(): void {
    console.log('User logged out');
  }

  onSecretIconClick() {
    const now = Date.now();
    if (now - this.lastClickAt > this.clickWindowMs) {
      this.secretClickCount = 0;
    }
    this.lastClickAt = now;
    this.secretClickCount += 1;
    if (this.secretClickCount >= 5) {
      this.secretClickCount = 0;
      this.openRegisterFlow();
    }
  }

  private async openRegisterFlow() {
    const { RegisterUserDialogComponent } = await import('../register-user-dialog/register-user-dialog.component');
    const registerRef = this.dialog.open(RegisterUserDialogComponent, { width: '420px' });
    registerRef.afterClosed().subscribe(async (reg) => {
      if (!reg) return;
      const { VerificationQuizDialogComponent } = await import('../verification-quiz-dialog/verification-quiz-dialog.component');
      const verifyRef = this.dialog.open(VerificationQuizDialogComponent, { width: '420px' });
      verifyRef.afterClosed().subscribe(async (ok) => {
        if (!ok) return;
        this.http.post('http://192.168.8.8:5556/api/users', reg).subscribe({
          next: () => this.snackBar.open('User registered!', 'Close', { duration: 2500 }),
          error: () => this.snackBar.open('Registration failed', 'Close', { duration: 2500 })
        });
      });
    });
  }
}
