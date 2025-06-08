import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialGuideComponent } from './tutorial-guide.component';

describe('TutorialGuideComponent', () => {
  let component: TutorialGuideComponent;
  let fixture: ComponentFixture<TutorialGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialGuideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
