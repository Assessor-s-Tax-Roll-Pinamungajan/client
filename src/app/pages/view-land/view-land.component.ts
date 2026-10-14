import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-view-land',
  standalone: true,
  templateUrl: './view-land.component.html',
  styleUrls: ['./view-land.component.css'],
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
    MatProgressSpinnerModule,
    
  ]
})
export class ViewLandComponent implements OnInit {


  records: any[] = [];
  filteredRecords: any[] = [];
  isLoading: boolean = false;
  searchText: string = '';
  selectedIndex: string = '';
  uniqueIndexes: string[]=[];
  selectedBarangay: string = '';
  uniqueBarangay: string[] = [];
  filteredIndexes: string[] = [];

  columnsToDisplay = [ 'assessor_no','cadastral_no', 'td_no', 'name_owner','index_no', 'action'];

  constructor(
    private http: HttpClient, 
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Read query parameters from URL once on init
    const params = this.route.snapshot.queryParams;
    if (params['search_query']) {
      this.searchText = params['search_query'];
    }
    if (params['barangay']) {
      this.selectedBarangay = params['barangay'];
    }
    if (params['index']) {
      this.selectedIndex = params['index'];
    }

    this.isLoading = true;
    this.http.get<any[]>(this.apiService.getAnislagUrl()).subscribe( {
      next: (data) => {
      this.records = data;
      this.filteredRecords = data;
      this.extractUniqueIndexes(); // Add this line
      this.extractUniqueBarangay(); // Add this line
      this.updateFilteredIndexes(); // Initialize filtered indexes
      
      // Apply filters after data is loaded if URL params exist
      if (this.searchText || this.selectedBarangay || this.selectedIndex) {
        this.applyFiltersWithoutUrlUpdate(); // Apply filters without updating URL (already set)
      }
      
      this.isLoading = false;
    }, error: () => {
      this.isLoading = false;
    }
    });
  }

  clearFilters() {
    this.searchText = '';
    this.selectedIndex = '';
    this.selectedBarangay = '';
    this.filteredRecords = this.records;
    this.updateFilteredIndexes(); // Reset filtered indexes
    this.updateUrlParams(); // Clear URL params
  }

  // 🔍 Filtering logic
  applyFilters() {
    this.filterRecords();
    // Update URL with current filter values
    this.updateUrlParams();
  }
  
  // Filter records without updating URL (used when loading from URL params)
  applyFiltersWithoutUrlUpdate() {
    this.filterRecords();
  }
  
  // Core filtering logic
  private filterRecords() {
    this.filteredRecords = this.records.filter(record => {
      const matchesSearch =
        this.searchText === '' ||
        record.name_owner?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        record.cadastral_no?.toLowerCase().includes(this.searchText.toLowerCase())||
        record.td_no?.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesIndex =
        this.selectedIndex === '' || record.index_no === this.selectedIndex;

      const matchesBarangay =
        this.selectedBarangay === '' || record.barangay === this.selectedBarangay;

      return matchesSearch && matchesIndex && matchesBarangay;
    });
  }
  
  // Update URL query parameters
  updateUrlParams() {
    const queryParams: any = {};
    
    if (this.searchText && this.searchText.trim()) {
      queryParams['search_query'] = this.searchText.trim();
    }
    
    if (this.selectedBarangay && this.selectedBarangay.trim()) {
      queryParams['barangay'] = this.selectedBarangay.trim();
    }
    
    if (this.selectedIndex && this.selectedIndex.trim()) {
      queryParams['index'] = this.selectedIndex.trim();
    }
    
    // Navigate with query params, preserving the current route
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : {},
      replaceUrl: true // Use replaceUrl to avoid cluttering browser history
    });
  }

  // 📦 Extract unique index numbers for dropdown
  extractUniqueIndexes() {
    const indexSet = new Set<string>();
    this.records.forEach(record => {
      indexSet.add(record.index_no);
    });
    this.uniqueIndexes = Array.from(indexSet).sort();
  }

  extractUniqueBarangay() {
    const barangaySet = new Set<string>();
    this.records.forEach(record => {
      barangaySet.add(record.barangay);
    });
    this.uniqueBarangay = Array.from(barangaySet).sort();
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
      this.filteredIndexes = Array.from(indexSet).sort();
    }
    
    // Reset selected index if it's no longer valid
    if (this.selectedIndex !== '' && !this.filteredIndexes.includes(this.selectedIndex)) {
      this.selectedIndex = '';
    }
  }

  // Method to handle barangay selection change
  onBarangayChange() {
    this.updateFilteredIndexes();
    this.applyFilters(); // This will also update URL params
  }
  
}

