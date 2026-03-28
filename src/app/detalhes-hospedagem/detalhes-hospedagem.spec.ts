import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhesHospedagem } from './detalhes-hospedagem';

describe('DetalhesHospedagem', () => {
  let component: DetalhesHospedagem;
  let fixture: ComponentFixture<DetalhesHospedagem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesHospedagem],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalhesHospedagem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
