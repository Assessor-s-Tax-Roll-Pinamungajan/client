import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { LandService } from '../land.service';

@Component({
  selector: 'app-bulk-add-land',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './bulk-add-land.component.html',
  styleUrls: ['./bulk-add-land.component.css']
})
export class BulkAddLandComponent implements OnInit {
  bulkForm: FormGroup;
  indexOptions: string[] = [];
  barangayOptions: string[] = [];
  allLots: any[] = [];
  displayedColumns: string[] = [
    'assessor_no', 'cadastral_no', 'td_no', 'arp_A', 'arp_B', 'arp_C', 'arp_D', 'arp_E', 'arp_F',
    'name_owner', 'title_no', 'area', 'classification_no', 'improvement_1', 'improvement_2',
    'mch', 'oth', 'barangay', 'index_no', 'remarks', 'actions'
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private landService: LandService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<BulkAddLandComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.bulkForm = this.fb.group({
      landRecords: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadIndexOptions();
    this.loadBarangayOptions();
    this.loadAllLots();
    this.addNewRow(); // Start with one empty row
  }

  get landRecords(): FormArray {
    return this.bulkForm.get('landRecords') as FormArray;
  }

  createLandRecordForm(): FormGroup {
    return this.fb.group({
      assessor_no: ['', Validators.required],
      cadastral_no: ['', Validators.required],
      td_no: [''],
      arp_A: [''],
      arp_B: [''],
      arp_C: [''],
      arp_D: [''],
      arp_E: [''],
      arp_F: [''],
      name_owner: ['', Validators.required],
      title_no: [''],
      area: [''],
      classification_no: [''],
      improvement_1: [''],
      improvement_2: [''],
      mch: [''],
      oth: [''],
      barangay: ['', Validators.required],
      index_no: ['', Validators.required],
      remarks: ['']
    });
  }

  addNewRow() {
    this.landRecords.push(this.createLandRecordForm());
  }

  removeRow(index: number) {
    if (this.landRecords.length > 1) {
      this.landRecords.removeAt(index);
    }
  }

  loadIndexOptions() {
    this.http.get<any[]>('http://localhost:5556/api/anislag/indexes').subscribe({
      next: (data) => {
        this.indexOptions = data.map(item => item.index_no).sort();
      },
      error: (error) => {
        console.error('Error loading index options:', error);
      }
    });
  }

  loadBarangayOptions() {
    this.http.get<any[]>('http://localhost:5556/api/anislag/barangays').subscribe({
      next: (data) => {
        this.barangayOptions = data.map(item => item.barangay).sort();
      },
      error: (error) => {
        console.error('Error loading barangay options:', error);
      }
    });
  }

  loadAllLots() {
    this.http.get<any[]>('http://localhost:5556/api/anislag').subscribe({
      next: (data) => {
        this.allLots = data;
      },
      error: (error) => {
        console.error('Error loading lots:', error);
      }
    });
  }

  onSubmit() {
    if (this.bulkForm.valid) {
      const formValue = this.bulkForm.value;
      const landRecords = formValue.landRecords;
      
      // Process each land record
      const promises = landRecords.map((record: any) => {
        return this.landService.create(record).toPromise();
      });

      Promise.all(promises)
        .then(() => {
          this.snackBar.open(`Successfully added ${landRecords.length} land records!`, 'Close', {
            duration: 3000
          });
          this.dialogRef.close(true);
        })
        .catch((error) => {
          console.error('Error adding land records:', error);
          this.snackBar.open('Error adding land records. Please try again.', 'Close', {
            duration: 3000
          });
        });
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000
      });
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}