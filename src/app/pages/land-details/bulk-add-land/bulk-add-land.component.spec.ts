import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkAddLandComponent } from './bulk-add-land.component';

describe('BulkAddLandComponent', () => {
  let component: BulkAddLandComponent;
  let fixture: ComponentFixture<BulkAddLandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkAddLandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkAddLandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
