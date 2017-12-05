import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { WalkthroughComponent } from './walkthrough.component';
import { NoDependenciesFakeLanguageModule } from '../language/testing';

describe('Component: FlogoInstructions Modal', () => {

  let comp: WalkthroughComponent;
  let fixture: ComponentFixture<WalkthroughComponent>;

  const findCurrentlySelectedStepNumber = (fromFixture: ComponentFixture<any>) => {
    const selectedIndex = fromFixture.debugElement
      .queryAll(By.css('[data-hook="walkthrough-step"]'))
      .findIndex(e => e.classes['walkthrough-option-selected']);
    return selectedIndex + 1;
  };

  // synchronous beforeEach
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NoDependenciesFakeLanguageModule],
      declarations: [WalkthroughComponent, ModalComponent], // declare the test component
    });
    return TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalkthroughComponent);
    comp = fixture.componentInstance; // WalkthroughComponent test instance
    fixture.detectChanges();
  });

  it('When load, should select by default the step number 1', () => {
    expect(findCurrentlySelectedStepNumber(fixture)).toEqual(1);
  });


  it('When load, back button must not exist and next button should exist', () => {
    const backButton = fixture.debugElement.query(By.css('#buttonBack'));
    expect(backButton).toBeNull();
    const nextButton = fixture.debugElement.query(By.css('#buttonNext'));
    expect(nextButton).not.toBeNull(nextButton);
  });

  it('Click on next  should move to step 2', () => {
    const buttonNextDebug = fixture.debugElement.query(By.css('#buttonNext'));
    const button = buttonNextDebug.nativeElement;
    button.click();
    fixture.detectChanges();
    expect(findCurrentlySelectedStepNumber(fixture)).toEqual(2);
  });

  it('When last step is selected, close button should exist', () => {
    const instructions = fixture.componentInstance;
    instructions.currentIndex = instructions.steps.length - 1;

    fixture.detectChanges();
    const buttonClose = fixture.debugElement.query(By.css('#buttonClose'));
    expect(buttonClose).not.toBeNull();
  });

  it('Click on back  should move to step 3', () => {
    const instructions = fixture.componentInstance;
    instructions.currentIndex = instructions.steps.length - 1;
    fixture.detectChanges();

    const buttonBackDebug = fixture.debugElement.query(By.css('#buttonBack'));
    const button = buttonBackDebug.nativeElement;

    button.click();
    fixture.detectChanges();
    expect(findCurrentlySelectedStepNumber(fixture)).toEqual(3);
  });

});
