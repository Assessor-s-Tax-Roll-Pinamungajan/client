import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { LandService } from '../land.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-land-update',
  standalone: true,
  imports: [
        CommonModule,
        FormsModule,
        RouterModule,
    
        // Angular Material Modules
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatSortModule,
        MatOptionModule,
        MatDialogModule,
         ReactiveFormsModule
         
        
  ],
  templateUrl: './land-update.component.html',
  styleUrl: './land-update.component.css',

})
export class LandUpdateComponent {

  postForm: FormGroup;
  indexOptions: string[] = [];
  barangayOptions: string[] = [];
  cancelReasons = [
    { value: '', label: 'None' },
    { value: 'subdivision', label: 'Subdivision' },
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

  constructor (
    private fb: FormBuilder, 
    private ps: LandService,
    @Inject(MAT_DIALOG_DATA) public data:any,
    private http: HttpClient
  ) {
    console.log(data);
    this.postForm = this.fb.group({
      assessor_no: [this.data.assessor_no || '', Validators.required],
      cadastral_no: [this.data.cadastral_no || '', Validators.required],
      name_owner: [this.data.name_owner || '', Validators.required],
      index_no: [this.data.index_no || '', Validators.required],
      barangay: [this.data.barangay || '', Validators.required],
      arp_A: [this.data.arp_A || ''],
      arp_B: [this.data.arp_B || ''],
      arp_C: [this.data.arp_C || ''],
      arp_D: [this.data.arp_D || ''],
      arp_E: [this.data.arp_E || ''],
      arp_F: [this.data.arp_F || ''],
      title_no: [this.data.title_no || ''],
      area: [this.data.area || ''],
      classification_no: [this.data.classification_no || ''],
      improvement_1: [this.data.improvement_1 || ''],
      improvement_2: [this.data.improvement_2 || ''],
      mch: [this.data.mch || ''],
      oth: [this.data.oth || ''],
      // cancel: [this.data.cancel || ''],
      cancel_reason: [this.data.cancel_reason || ''],
      remarks: [this.data.remarks || ''],
      // For dynamic fields:
      subdivision_assessor_nos: this.fb.array([]),
      transfer_assessor_no: [''],
      duplicate_assessor_no: [''],
      consolidate_assessor_nos: this.fb.array([]),
    });

    // Populate dynamic fields if editing
    if (this.data.cancel_reason === 'subdivision' && this.data.cancel_details?.lots) {
      this.data.cancel_details.lots.forEach((lot: any) => {
        this.subdivisionAssessorNos.push(this.fb.control(lot.id));
      });
    }
    if (this.data.cancel_reason === 'consolidate' && this.data.cancel_details?.lots) {
      this.data.cancel_details.lots.forEach((lot: any) => {
        this.consolidateAssessorNos.push(this.fb.control(lot.id));
      });
    }
    if (this.data.cancel_reason === 'transfer' && this.data.cancel_details?.lots?.[0]) {
      this.postForm.get('transfer_assessor_no')?.setValue(this.data.cancel_details.lots[0].id);
    }
    if (this.data.cancel_reason === 'duplicate' && this.data.cancel_details?.lots?.[0]) {
      this.postForm.get('duplicate_assessor_no')?.setValue(this.data.cancel_details.lots[0].id);
    }

    // Fetch dropdown options
    this.http.get<any[]>('http://localhost:5556/anislag/indexes').subscribe(data => {
      this.indexOptions = data.map(item => item.index_no).filter((v: string) => !!v);
    });
    this.http.get<any[]>('http://localhost:5556/anislag/barangays').subscribe(data => {
      this.barangayOptions = data.map(item => item.barangay).filter((v: string) => !!v);
    });
    this.http.get<any[]>('http://localhost:5556/anislag').subscribe(data => {
      this.allLots = data;
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

  onSubmit(){
    this.warningMessage = '';
    const errors: string[] = [];
    const formValue = this.postForm.value;
    // Compare each field to original data
    Object.keys(formValue).forEach(key => {
      // Skip dynamic cancel_details fields, handle below
      if ([
        'subdivision_assessor_nos',
        'transfer_assessor_no',
        'duplicate_assessor_no',
        'consolidate_assessor_nos',
      ].includes(key)) return;
      if (formValue[key] !== this.data[key]) {
        // Basic validation: required fields
        if ((key === 'assessor_no' || key === 'cadastral_no' || key === 'name_owner' || key === 'index_no' || key === 'barangay') && !formValue[key]) {
          errors.push(`${key.replace('_', ' ')} is required.`);
        }
        // Add more validation as needed
      }
    });
    // Validate cancel_reason and cancel_details
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
        .filter(Boolean);
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
      ...rest
    } = formValue;

    const payload = {
      ...rest,
      cancel_details,
    };

    this.ps.update(this.data.id, payload).subscribe((data) => {
      location.reload();
    });
  }
}
