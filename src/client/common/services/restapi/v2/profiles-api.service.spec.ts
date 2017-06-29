import {inject, TestBed} from "@angular/core/testing";
import {MockBackend} from "@angular/http/testing";
import {BaseRequestOptions, Http, Response, ResponseOptions} from "@angular/http";
import {ProfilesAPIService} from "./profiles-api.service";
import {HttpUtilsService} from "../http-utils.service";

describe("Service: ProfilesAPIService", ()=>{
  let mockbackend, service = null;
  let sampleApps = {
    data: [
      {
        type: "Atmel AVR",
        i18nKey: "ATMEL-AVR"
      },
      {
        type: "Atmel SAM",
        i18nKey: "ATMEL-SAM"
      },
      {
        type: "Espressif 32",
        i18nKey: "ESPRESSIF-32"
      }
    ]
  };

  beforeEach(()=> {
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
    })

  });

  beforeEach(inject([ProfilesAPIService, MockBackend], (serviceAPI: ProfilesAPIService, mock: MockBackend)=> {
    service = serviceAPI;
    mockbackend = mock;
  }));

  it("Should return 3 sets of devices", (done) => {
    mockbackend.connections.subscribe(connection => {
      let options = new ResponseOptions({body: JSON.stringify(sampleApps)});
      connection.mockRespond(new Response(options));
    });
    service.getProfilesList()
      .then((res)=> {
        expect(res.length).toEqual(3);
        done();
      });
  });

  it("Should have type property in the response for device entity", (done) => {
    mockbackend.connections.subscribe(connection => {
      let options = new ResponseOptions({body: JSON.stringify(sampleApps)});
      connection.mockRespond(new Response(options));
    });
    service.getProfilesList()
      .then((res)=> {
        expect(res[0].type).toBeDefined();
        done();
      });
  });

  it("Should have i18nKey property in the response for device entity", (done) => {
    mockbackend.connections.subscribe(connection => {
      let options = new ResponseOptions({body: JSON.stringify(sampleApps)});
      connection.mockRespond(new Response(options));
    });
    service.getProfilesList()
      .then((res)=> {
        expect(res[0].i18nKey).toBeDefined();
        done();
      });
  });
});
