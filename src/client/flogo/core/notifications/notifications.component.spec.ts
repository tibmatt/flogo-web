import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { FakeTranslatePipe } from '@flogo/core/language/testing';
import { Notification } from './notifications';
import { NotificationsService } from './notifications.service';
import { NotificationsComponent } from './notifications.component';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let mockNotificationService: Partial<NotificationsService>;
  let fixture: ComponentFixture<NotificationsComponent>;

  beforeEach(async(() => {
    mockNotificationService = {
      notifications$: new Subject<Notification[]>(),
      removeNotification: () => {},
    };
    spyOn(mockNotificationService, 'removeNotification').and.callThrough();
    TestBed.configureTestingModule({
      declarations: [
        NotificationsComponent,
        FakeTranslatePipe,
      ],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationService }
      ],
    })
    .compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    (mockNotificationService.notifications$ as Subject<Notification[]>).next([
      { type: 'success', message: 'notification 3' },
      { type: 'success', message: 'notification 2' },
      { type: 'error', message: 'notification 1' },
    ]);
    fixture.detectChanges();
  }));

  afterEach(() => {
    (mockNotificationService.notifications$ as Subject<any>).complete();
  });

  it('should render all notifications', () => {
    const notifications = fixture.nativeElement.querySelectorAll('[data-notification-type]');
    expect(notifications.length).toEqual(3);
  });

  it('should render success notifications', () => {
    const notifications = fixture.nativeElement.querySelectorAll('[data-notification-type="success"]');
    expect(notifications.length).toEqual(2);
  });

  it('should render error notifications', () => {
    const notifications = fixture.nativeElement.querySelectorAll('[data-notification-type="error"]');
    expect(notifications.length).toEqual(1);
  });

  it('should close a notification when clicking on close button', () => {
    const closeErrorNotification = fixture.nativeElement.querySelector('[data-notification-type="error"] .qa-close');
    closeErrorNotification.click();
    const mockMethod = mockNotificationService.removeNotification as jasmine.Spy;
    expect(mockMethod).toHaveBeenCalledTimes(1);
    expect(mockMethod.calls.mostRecent().args[0]).toEqual({
      type: 'error',
      message: 'notification 1',
    });
  });

});
