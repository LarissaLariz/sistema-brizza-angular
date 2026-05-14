import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminImoveis } from './admin-imoveis';

describe('AdminImoveis', () => {
  let component: AdminImoveis;
  let fixture: ComponentFixture<AdminImoveis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminImoveis],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminImoveis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
