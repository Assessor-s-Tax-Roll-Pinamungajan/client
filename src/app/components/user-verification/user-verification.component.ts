import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-verification',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-verification.component.html',
  styleUrls: ['./user-verification.component.css']
})
export class UserVerificationComponent {
  errorMessage = '';
  verificationForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserVerificationComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: {
      changes: string[];
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
      if (username && password) {
        // Verify with backend
        this.userService.verifyUser({ username, password }).subscribe({
          next: (response) => {
            const changes = (this.data?.changes || []).join(', ');
            const changesText = `Updated by ${username} on ${new Date().toLocaleString()}. Changes: ${changes}`;
            this.dialogRef.close({
              verified: true,
              username: username,
              changes: changesText
            });
          },
          error: (error) => {
            this.errorMessage = 'Invalid username or password. Please try again.';
          }
        });
      } else {
        this.errorMessage = 'Invalid username or password. Please try again.';
      }
    }
  }
}


