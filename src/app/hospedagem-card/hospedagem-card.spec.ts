import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospedagemCard } from './hospedagem-card';

describe('HospedagemCard', () => {
  let component: HospedagemCard;
  let fixture: ComponentFixture<HospedagemCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospedagemCard],
    }).compileComponents();

    fixture = TestBed.createComponent(HospedagemCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
