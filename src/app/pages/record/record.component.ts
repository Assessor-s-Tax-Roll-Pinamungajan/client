import { Component, OnInit } from '@angular/core';
import { LandService } from '../land-details/land.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-record',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './record.component.html',
  styleUrl: './record.component.css'
})
export class RecordComponent implements OnInit {


  records: any[] = [];
  filteredRecords: any[] = [];
  searchText: string = '';
  selectedIndex: string = '';
  uniqueIndexes: string[]=[];
  selectedBarangay: string = '';
  uniqueBarangay: string[] = [];
  filteredIndexes: string[] = [];
  showTable: boolean = false; // Add this property to control table visibility

  columnsToDisplay = [ 'assessor_no','cadastral_no', 'name_owner','index_no', 'action'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:5556/api/anislag').subscribe(data => {
      this.records = data;
      this.filteredRecords = data;
      this.extractUniqueIndexes(); // Add this line
      this.extractUniqueBarangay(); // Add this line
      this.updateFilteredIndexes(); // Initialize filtered indexes
    });
  }

  clearFilters() {
    this.searchText = '';
    this.selectedIndex = '';
    this.selectedBarangay = '';
    this.filteredRecords = this.records;
    this.updateFilteredIndexes(); // Reset filtered indexes
  }
// delete land
  // onDelete(id: number) {
  //   if (confirm('Are you sure you want to delete this record?')) {
  //     this.http.delete(`http://localhost:5556/api/anislag/${id}`).subscribe(() => {
  //       this.records = this.records.filter(r => r.id !== id);
  //       this.filteredRecords = this.filteredRecords.filter(r => r.id !== id);
  //       this.extractUniqueIndexes(); // Update indexes too
  //       this.extractUniqueBarangay(); // Update barangay too
  //     });
  //   }
  // }

  // 🔍 Filtering logic
  applyFilters() {
    this.filteredRecords = this.records.filter(record => {
      const matchesSearch =
        this.searchText === '' ||
        record.name_owner?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        record.cadastral_no?.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesIndex =
        this.selectedIndex === '' || record.index_no === this.selectedIndex;

      const matchesBarangay =
        this.selectedBarangay === '' || record.barangay === this.selectedBarangay;

      return matchesSearch && matchesIndex && matchesBarangay;
    });
  }

  // 📦 Extract unique index numbers for dropdown
  extractUniqueIndexes() {
    const indexSet = new Set<string>();
    this.records.forEach(record => {
      indexSet.add(record.index_no);
    });
    this.uniqueIndexes = Array.from(indexSet);
  }

  extractUniqueBarangay() {
    const barangaySet = new Set<string>();
    this.records.forEach(record => {
      barangaySet.add(record.barangay);
    });
    this.uniqueBarangay = Array.from(barangaySet);
  }

  // New method to update filtered indexes based on selected barangay
  updateFilteredIndexes() {
    if (this.selectedBarangay === '') {
      // If no barangay is selected, show all indexes
      this.filteredIndexes = [...this.uniqueIndexes];
    } else {
      // Filter indexes based on selected barangay
      const indexSet = new Set<string>();
      this.records.forEach(record => {
        if (record.barangay === this.selectedBarangay) {
          indexSet.add(record.index_no);
        }
      });
      this.filteredIndexes = Array.from(indexSet);
    }
    
    // Reset selected index if it's no longer valid
    if (this.selectedIndex !== '' && !this.filteredIndexes.includes(this.selectedIndex)) {
      this.selectedIndex = '';
    }
  }

  // Method to handle barangay selection change
  onBarangayChange() {
    this.updateFilteredIndexes();
    this.applyFilters();
  }
  
  // Summary properties
  get lotCount(): number {
    return this.filteredRecords.length;
  }

  get totalArea(): number {
    return this.filteredRecords.reduce((sum, lot) => sum + (parseFloat(lot.area) || 0), 0);
  }

  get uniqueClassifications(): string[] {
    const classSet = new Set<string>();
    this.filteredRecords.forEach(lot => {
      if (lot.classification_no) {
        // Split by comma or space if multiple codes in one field
        lot.classification_no.toString().split(/[, ]+/).forEach((c: string) => classSet.add(c.trim()));
      }
    });
    return Array.from(classSet).filter(Boolean);
  }

  get classificationLabels(): string {
    const map: { [key: string]: string } = {
      'A': 'Agriculture',
      'R': 'Residential',
      'C': 'Commercial',
      'I': 'Industrial',
      'M': 'Mineral',
      'T': 'Timberland'
    };
    return this.uniqueClassifications
      .map(code => {
        // If code is like '3A', extract the letter
        const letter = code.replace(/[^A-Z]/gi, '').toUpperCase();
        return map[letter] ? `${code} (${map[letter]})` : code;
      })
      .join(', ');
  }

  get classificationCounts(): { [key: string]: number } {
    const counts: { [key: string]: number } = { A: 0, R: 0, C: 0, I: 0, M: 0, T: 0 };
    this.filteredRecords.forEach(lot => {
      if (lot.classification_no) {
        // Split by comma or space if multiple codes in one field
        lot.classification_no.toString().split(/[, ]+/).forEach((c: string) => {
          const letter = c.replace(/[^A-Z]/gi, '').toUpperCase();
          if (counts.hasOwnProperty(letter)) {
            counts[letter]++;
          }
        });
      }
    });
    return counts;
  }

  get otherClassifications(): { code: string, count: number }[] {
    const standard = ['A', 'C', 'M', 'R', 'I', 'T'];
    const counts: { [key: string]: number } = {};
    this.filteredRecords.forEach(lot => {
      if (lot.classification_no) {
        lot.classification_no.toString().split(/[, ]+/).forEach((c: string) => {
          const code = c.trim();
          // Only add if not a standard single-letter code
          if (code && !standard.includes(code) && code !== '') {
            counts[code] = (counts[code] || 0) + 1;
          }
        });
      }
    });
    // Return as array for *ngFor
    return Object.entries(counts).map(([code, count]) => ({ code, count }));
  }

  exportToExcel() {
    // Export table data and summary data as a single CSV
    this.exportCombinedData();
  }

  private exportCombinedData() {
    // Helper function to properly escape CSV values
    const escapeCsvValue = (value: any): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // If the value contains comma, newline, or quote, wrap it in quotes and escape internal quotes
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Table headers
    const tableHeaders = [
      'Assessors Lot No.',
      'Cadastral Lot No.',
      'ARP A',
      'ARP B',
      'ARP C',
      'ARP D',
      'ARP E',
      'ARP F',
      'Name of Owner',
      'Title No.',
      'Area (sq.m.)',
      'Classification Code',
      'Improvement 1',
      'Improvement 2',
      'Mch',
      'Oth',
      'Index No.',
      'Barangay',
      'Cancel Reason'
    ];

    // Table data
    const tableData = this.filteredRecords.map(record => [
      escapeCsvValue(record.assessor_no),
      escapeCsvValue(record.cadastral_no),
      escapeCsvValue(record.arp_A),
      escapeCsvValue(record.arp_B),
      escapeCsvValue(record.arp_C),
      escapeCsvValue(record.arp_D),
      escapeCsvValue(record.arp_E),
      escapeCsvValue(record.arp_F),
      escapeCsvValue(record.name_owner),
      escapeCsvValue(record.title_no),
      escapeCsvValue(record.area),
      escapeCsvValue(record.classification_no),
      escapeCsvValue(record.improvement_1),
      escapeCsvValue(record.improvement_2),
      escapeCsvValue(record.mch),
      escapeCsvValue(record.oth),
      escapeCsvValue(record.index_no),
      escapeCsvValue(record.barangay),
      escapeCsvValue(record.cancel_reason)
    ]);

    // Summary data
    const standardClassifications = [
      { code: 'A', name: 'Agriculture' },
      { code: 'C', name: 'Commercial' },
      { code: 'M', name: 'Mineral' },
      { code: 'R', name: 'Residential' },
      { code: 'I', name: 'Industrial' },
      { code: 'T', name: 'Timberland' }
    ];

    const summaryData = [
      [''],
      ['SUMMARY INFORMATION'],
      ['Total Assessor\'s Lot:', this.lotCount],
      ['Total Area:', `${this.totalArea.toFixed(2)} sq.m.`],
      ['Index No.', this.selectedIndex || 'All Index Numbers'],
      ['Barangay:', this.selectedBarangay || 'All Barangays'],
      [''],
      ['CLASSIFICATION SUMMARY'],
      ...standardClassifications.map(item => [
        `${item.code} (${item.name}):`,
        this.classificationCounts[item.code]
      ]),
      ...this.otherClassifications.map(item => [
        `${item.code} (Other):`,
        item.count
      ])
    ];

    // Combine table and summary data
    const combinedContent = [
      tableHeaders.join(','),
      ...tableData.map(row => row.join(',')),
      ...summaryData.map(row => 
        row.map(cell => escapeCsvValue(cell)).join(',')
      )
    ].join('\n');

    this.downloadFile(combinedContent, `land_records_combined_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  }



  private downloadFile(content: string, filename: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
