import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleTopicViewComponent } from './title-topic-view.component';

describe('TitleTopicViewComponent', () => {
  let component: TitleTopicViewComponent;
  let fixture: ComponentFixture<TitleTopicViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TitleTopicViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TitleTopicViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
