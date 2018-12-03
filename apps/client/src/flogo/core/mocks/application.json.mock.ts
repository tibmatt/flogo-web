export const MOCK_DEVICE_APP_DATA = {
  type: 'flogo:device',
  triggers: [
    {
      ref: 'github.com/TIBCOSoftware/flogo-contrib/trigger/rest',
      settings: { port: null },
      handlers: [
        {
          settings: {
            method: null,
            path: null,
            autoIdReply: null,
            useReplyHandler: null,
          },
          outputs: {
            params: null,
            pathParams: null,
            queryParams: null,
            content: null,
          },
          actionId: 'someID',
        },
      ],
    },
  ],
  actions: [
    {
      data: {
        flow: {
          type: 1,
          attributes: [],
          rootTask: {},
        },
      },
    },
  ],
  device: {
    deviceType: 'Intel ARC32',
    profile: 'github.com/TIBCOSoftware/flogo-contrib/device/profile/feather_m0_wifi',
  },
};

export const MOCK_MICROSERVICE_APP_DATA = {
  type: 'flogo:app',
  triggers: [
    {
      ref: 'github.com/TIBCOSoftware/flogo-contrib/trigger/rest',
      settings: { port: null },
      handlers: [
        {
          settings: {
            method: null,
            path: null,
            autoIdReply: null,
            useReplyHandler: null,
          },
          outputs: {
            params: null,
            pathParams: null,
            queryParams: null,
            content: null,
          },
          actionId: 'someID',
        },
      ],
    },
  ],
  actions: [
    {
      data: {
        flow: {
          type: 1,
          attributes: [],
          rootTask: {},
        },
      },
    },
  ],
};
