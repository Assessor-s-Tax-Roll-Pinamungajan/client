import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UserVerificationComponent } from '../../../components/user-verification/user-verification.component';
import { UserService } from '../../../services/user.service';
import { BulkAddLandComponent } from '../bulk-add-land/bulk-add-land.component';

@Component({
  selector: 'app-add-land',
  standalone: true,
  templateUrl: './add-land.component.html',
  styleUrl: './add-land.component.css',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatOptionModule,
    MatAutocompleteModule
  ]
})
export class AddLandComponent {
  postForm: FormGroup;
  indexOptions: string[] = [];
  filteredIndexes: string[] = [];
  barangayOptions: string[] = [];
  
  // Triple click detection
  private clickCount = 0;
  private clickTimer: any;
  private readonly TRIPLE_CLICK_DELAY = 500; // 500ms window for triple click
  cancelReasons = [
    { value: '', label: 'None' },
    { value: 'subdivision', label: 'Cancelled due to subdivision' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'consolidate', label: 'Consolidate' },
    { value: 'duplicate', label: 'Duplicate' },
  ];
  warningMessage: string = '';
  allLots: any[] = [];

  get cancelReason() {
    return this.postForm.get('cancel_reason')?.value;
  }
  get subdivisionAssessorNos(): FormArray<FormControl> {
    return this.postForm.get('subdivision_assessor_nos') as FormArray<FormControl>;
  }
  get consolidateAssessorNos(): FormArray<FormControl> {
    return this.postForm.get('consolidate_assessor_nos') as FormArray<FormControl>;
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService
  ) {
    this.postForm = this.fb.group({
      assessor_no: ['', Validators.required],
      cadastral_no: ['', Validators.required],
      td_no: [''],
      name_owner: ['', Validators.required],
      index_no: ['', Validators.required],
      barangay: ['', Validators.required],
      arp_A: [''],
      arp_B: [''],
      arp_C: [''],
      arp_D: [''],
      arp_E: [''],
      arp_F: [''],
      title_no: [''],
      area: [''],
      classification_no: [''],
      improvement_1: [''],
      improvement_2: [''],
      mch: [''],
      oth: [''],
      // cancel: [''],
      cancel_reason: [''],
      subdivision_assessor_nos: this.fb.array([]),
      transfer_assessor_no: [''],
      duplicate_assessor_no: [''],
      consolidate_assessor_nos: this.fb.array([]),
      remarks: [''],
    });
    this.http.get<any[]>('http://192.168.8.8:5556/api/anislag/indexes').subscribe(data => {
      this.indexOptions = data.map(item => item.index_no).filter((v: string) => !!v);
      this.filteredIndexes = this.indexOptions.slice();
    });
    this.http.get<any[]>('http://192.168.8.8:5556/api/anislag/barangays').subscribe(data => {
      this.barangayOptions = data.map(item => item.barangay).filter((v: string) => !!v);
    });
    this.http.get<any[]>('http://192.168.8.8:5556/api/anislag').subscribe(data => {
      this.allLots = data;
    });
    // Listen for index_no changes to filter options
    this.postForm.get('index_no')?.valueChanges.subscribe(value => {
      this.filteredIndexes = this.indexOptions.filter(option =>
        option.toLowerCase().includes((value || '').toLowerCase())
      );
    });
  }

  addSubdivisionAssessorNo() {
    this.subdivisionAssessorNos.push(this.fb.control(''));
  }
  removeSubdivisionAssessorNo(i: number) {
    this.subdivisionAssessorNos.removeAt(i);
  }
  addConsolidateAssessorNo() {
    this.consolidateAssessorNos.push(this.fb.control(''));
  }
  removeConsolidateAssessorNo(i: number) {
    this.consolidateAssessorNos.removeAt(i);
  }

  onSubmit() {
    this.warningMessage = '';
    const errors: string[] = [];
    const formValue = this.postForm.value;
    // Basic validation (required fields)
    Object.keys(formValue).forEach(key => {
      if ([
        'subdivision_assessor_nos',
        'transfer_assessor_no',
        'duplicate_assessor_no',
        'consolidate_assessor_nos',
      ].includes(key)) return;
      if ((key === 'assessor_no' || key === 'cadastral_no' || key === 'name_owner' || key === 'index_no' || key === 'barangay') && !formValue[key]) {
        errors.push(`${key.replace('_', ' ')} is required.`);
      }
    });
    if (formValue.cancel_reason === 'subdivision') {
      if (this.subdivisionAssessorNos.length < 1) {
        errors.push('At least one subdivision assessor_no is required.');
      }
      this.subdivisionAssessorNos.value.forEach((v: string, i: number) => {
        if (!v) errors.push(`Subdivision assessor_no #${i + 1} is empty.`);
      });
    }
    if (formValue.cancel_reason === 'consolidate') {
      if (this.consolidateAssessorNos.length < 1) {
        errors.push('At least one consolidate assessor_no is required.');
      }
      this.consolidateAssessorNos.value.forEach((v: string, i: number) => {
        if (!v) errors.push(`Consolidate assessor_no #${i + 1} is empty.`);
      });
    }
    if (formValue.cancel_reason === 'transfer' && !formValue.transfer_assessor_no) {
      errors.push('Transfer assessor_no is required.');
    }
    if (formValue.cancel_reason === 'duplicate' && !formValue.duplicate_assessor_no) {
      errors.push('Duplicate assessor_no is required.');
    }
    if (errors.length > 0) {
      this.warningMessage = 'Please fix the following issues before submitting:\n' + errors.join('\n');
      return;
    }
    // Prepare cancel_details based on reason
    let cancel_details;
    const findLot = (id: number) => this.allLots.find(lot => lot.id === id);

    if (formValue.cancel_reason === 'subdivision') {
      const relatedLots = this.subdivisionAssessorNos.value
        .map(findLot)
        .filter(Boolean); // Filter out nulls if a lot isn't found
      cancel_details = {
        lots: relatedLots.map(lot => ({ id: lot.id, assessor_no: lot.assessor_no }))
      };
    } else if (['transfer', 'duplicate'].includes(formValue.cancel_reason)) {
      const lotId = formValue.transfer_assessor_no || formValue.duplicate_assessor_no;
      const relatedLot = findLot(lotId);
      if (relatedLot) {
        cancel_details = {
          lots: [{ id: relatedLot.id, assessor_no: relatedLot.assessor_no }]
        };
      }
    } else if (formValue.cancel_reason === 'consolidate') {
        const relatedLots = this.consolidateAssessorNos.value
        .map(findLot)
        .filter(Boolean);
      cancel_details = {
        lots: relatedLots.map(lot => ({ id: lot.id, assessor_no: lot.assessor_no }))
      };
    }
    // Only send fields that exist in the backend model
    const {
      subdivision_assessor_nos,
      transfer_assessor_no,
      duplicate_assessor_no,
      consolidate_assessor_nos,
      cancel_reason,
      ...rest
    } = formValue;
    const payload = {
      ...rest,
      cancel_reason: cancel_reason ? cancel_reason : null,
      cancel_details,
    };
    // Show verification dialog
    const dialogRef = this.dialog.open(UserVerificationComponent, {
      width: '500px',
      data: {
        changes: ['Adding new land record']
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.verified) {
        this.processAddLand(payload, result.changes);
      }
    });
  }

  private processAddLand(payload: any, userChanges: string) {
    // Add user verification info to the payload
    const finalPayload = {
      ...payload,
      changes: userChanges
    };

    this.http.post('http://192.168.8.8:5556/api/anislag', finalPayload).subscribe(() => {
      this.router.navigate(['/view-land']);
    });
  }

  // Triple click detection for bulk add
  onAddButtonClick() {
    this.clickCount++;
    
    if (this.clickCount === 1) {
      // First click - start timer
      this.clickTimer = setTimeout(() => {
        this.clickCount = 0;
        // Single click - normal submit
        this.onSubmit();
      }, this.TRIPLE_CLICK_DELAY);
    } else if (this.clickCount === 2) {
      // Second click - reset timer
      clearTimeout(this.clickTimer);
      this.clickTimer = setTimeout(() => {
        this.clickCount = 0;
        // Double click - do nothing
      }, this.TRIPLE_CLICK_DELAY);
    } else if (this.clickCount === 3) {
      // Third click - open bulk add dialog
      clearTimeout(this.clickTimer);
      this.clickCount = 0;
      this.openBulkAddDialog();
    }
  }

  openBulkAddDialog() {
    const dialogRef = this.dialog.open(BulkAddLandComponent, {
      width: '95vw',
      maxWidth: '95vw',
      height: '90vh',
      maxHeight: '90vh',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the page or reload data if needed
        window.location.reload();
      }
    });
  }
} 