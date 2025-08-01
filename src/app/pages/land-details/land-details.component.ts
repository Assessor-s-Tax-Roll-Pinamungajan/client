import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { LandUpdateComponent } from './land-update/land-update.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-land-details',
  standalone: true,
  templateUrl: './land-details.component.html',
  styleUrls: ['./land-details.component.css'], 
  imports:[CommonModule, HttpClientModule,MatDialogModule, RouterLink],
})
export class LandDetailsComponent implements OnInit {
  land: any;
  onFormAction() {
    console.log("New Post");
  }

  onUpdateDialog(post: any) {
    this.dialog.open(LandUpdateComponent, {
      data: post, // send specific post/land object
      width: '1000px', // ✅ Customize width
      height: 'auto', // ✅ Optional - set to 'auto' or a specific value like '600px'
      maxWidth: '100vw', // ✅ Optional - limits how wide it can grow on large screens
      disableClose: true, // optional: prevent closing on outside click
      autoFocus: false // optional: avoid auto-focusing first input
    });
  }

  onDelete(post: any) {
    console.log("Delete Post:", post);
  }

  getCancelNotice(): string | null {
    if (!this.land || !this.land.cancel_reason) return null;
    const reason = this.land.cancel_reason.toUpperCase();
    if (reason === 'SUBDIVISION' && this.land.cancel_details?.assessor_nos) {
      // handled in template for links
      return `This record has been marked as CANCELLED due to SUBDIVISION`;
    }
    if ((reason === 'TRANSFER' || reason === 'DUPLICATE' || reason === 'CONSOLIDATE') && this.land.cancel_details?.assessor_no) {
      return `This record has been marked as CANCELLED due to ${reason} (${this.land.cancel_details.assessor_no})`;
    }
    return `This record has been marked as CANCELLED due to ${reason}`;
  }

  getSubdivisionAssessorNos(): string[] {
    if (this.land && this.land.cancel_reason === 'subdivision' && this.land.cancel_details?.assessor_nos) {
      return this.land.cancel_details.assessor_nos;
    }
    return [];
  }
  
  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchLandData(id);
      }
    });
  }

  fetchLandData(id: string) {
    this.http.get(`http://localhost:5556/anislag/${id}`).subscribe(data => {
      this.land = data;
    });
  }
}
