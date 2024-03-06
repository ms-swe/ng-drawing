import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscStuffComponent } from './misc-stuff.component';

describe('MiscStuffComponent', () => {
  let component: MiscStuffComponent;
  let fixture: ComponentFixture<MiscStuffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiscStuffComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MiscStuffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
