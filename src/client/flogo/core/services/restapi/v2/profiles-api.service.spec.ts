import { inject, TestBed } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { BaseRequestOptions, Http, Response, ResponseOptions } from '@angular/http';
import { ProfilesAPIService } from './profiles-api.service';
import { HttpUtilsService } from '../http-utils.service';

describe('Service: ProfilesAPIService', () => {
  let mockbackend;
  let service = null;
  const sampleApps = {
    data: [
      {
        type: 'Atmel AVR',
        id: 'ATMEL-AVR'
      },
      {
        type: 'Atmel SAM',
        id: 'ATMEL-SAM'
      },
      {
        type: 'Espressif 32',
        id: 'ESPRESSIF-32'
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backendInstance: MockBackend, defaultOptions: BaseRequestOptions) => {
            return new Http(backendInstance, defaultOptions);
          },
          deps: [MockBackend, BaseRequestOptions]
        },
        ProfilesAPIService,
        HttpUtilsService
      ]
    });

  });

  beforeEach(inject([ProfilesAPIService, MockBackend], (serviceAPI: ProfilesAPIService, mock: MockBackend) => {
    service = serviceAPI;
    mockbackend = mock;
  }));

  it('Should return 3 sets of devices', (done) => {
    mockbackend.connections.subscribe(connection => {
      const options = new ResponseOptions({ body: JSON.stringify(sampleApps) });
      connection.mockRespond(new Response(options));
    });
    service.getProfilesList()
      .then((res) => {
        expect(res.length).toEqual(3);
        done();
      });
  });
});
