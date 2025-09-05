import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-verification-quiz-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Verification</h2>
    <mat-dialog-content>
      <p>Who is the 42nd mayor of Pinamungajan? or the current mayor?</p>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" style="width:100%;">
          <mat-label>Your Answer</mat-label>
          <input matInput formControlName="answer" required placeholder="Type full name">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()" [disabled]="form.invalid">Verify</button>
    </mat-dialog-actions>
  `
})
export class VerificationQuizDialogComponent {
  form: FormGroup;
  private accepted = [
    'mayor glenn f. baricuatro',
    'glenn f. baricuatro',
    'glenn baricuatro',
  ];
  constructor(private fb: FormBuilder, private ref: MatDialogRef<VerificationQuizDialogComponent>) {
    this.form = this.fb.group({ answer: ['', [Validators.required]] });
  }
  submit() {
    const val = String(this.form.value.answer || '').trim().toLowerCase();
    const ok = this.accepted.includes(val);
    this.ref.close(ok);
  }
}


