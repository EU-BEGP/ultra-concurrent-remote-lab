import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLaboratoryDialogComponent } from './create-laboratory-dialog.component';

describe('CreateLaboratoryDialogComponent', () => {
  let component: CreateLaboratoryDialogComponent;
  let fixture: ComponentFixture<CreateLaboratoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateLaboratoryDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateLaboratoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
