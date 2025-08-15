import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-verification-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>User Verification Required</h2>
    <mat-dialog-content>
      <p style="margin-bottom: 20px; color: #666;">
        Please enter your username and password to confirm this update.
      </p>
      
      <form [formGroup]="verificationForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 16px;">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" placeholder="Enter your username" required>
          <mat-error *ngIf="verificationForm.get('username')?.hasError('required')">
            Username is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 16px;">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" placeholder="Enter your password" required>
          <mat-icon matSuffix (click)="togglePasswordVisibility()" style="cursor: pointer;">
            {{ hidePassword ? 'visibility_off' : 'visibility' }}
          </mat-icon>
          <mat-error *ngIf="verificationForm.get('password')?.hasError('required')">
            Password is required
          </mat-error>
        </mat-form-field>

        <div *ngIf="errorMessage" style="margin-bottom: 16px;">
          <mat-card style="background:#ffebee; border:1px solid #e53935; color:#b71c1c; padding: 12px;">
            <mat-icon style="margin-right:8px; vertical-align: middle;">error</mat-icon>
            {{ errorMessage }}
          </mat-card>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="verificationForm.invalid">
        Verify & Update
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class UserVerificationDialogComponent {
  verificationForm: FormGroup;
  hidePassword = true;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserVerificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      originalData: any, 
      updatedData: any,
      changes: string[]
    }
  ) {
    this.verificationForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit() {
    if (this.verificationForm.valid) {
      const { username, password } = this.verificationForm.value;
      
      // For now, we'll use a simple verification
      // In a real application, you would verify against a database
      if (username && password) {
        // Create changes field with user info and changes
        const changes = this.data.changes.join(', ');
        const changesText = `Updated by ${username} on ${new Date().toLocaleString()}. Changes: ${changes}`;
        
        this.dialogRef.close({
          verified: true,
          username: username,
          changes: changesText
        });
      } else {
        this.errorMessage = 'Invalid username or password. Please try again.';
      }
    }
  }
}
