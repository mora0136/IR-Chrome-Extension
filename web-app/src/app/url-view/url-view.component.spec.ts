import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlViewComponent } from './url-view.component';

describe('UrlViewComponent', () => {
  let component: UrlViewComponent;
  let fixture: ComponentFixture<UrlViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UrlViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UrlViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
