import sinon from 'sinon';
import { DeviceAppImporterFactory } from './factory';

describe('importer.device.factory', () => {
  const sandbox = sinon.createSandbox();
  const deviceFactory = new DeviceAppImporterFactory({});
  test(
    'should classify contributions into activities and triggers',
    async () => {
      const contribManagerStub = sandbox.stub(deviceFactory, 'getContribDeviceManager');
      contribManagerStub.returns({
        find() {
          return Promise.resolve([
            { ref: 'activity1', type: 'flogo:device:activity' },
            { ref: 'trigger1', type: 'flogo:device:trigger' },
            { ref: 'trigger2', type: 'flogo:device:trigger' },
            { ref: 'activity2', type: 'flogo:device:activity' },
            { ref: 'activity3', type: 'flogo:device:activity' },
          ]);
        },
      });

      const contributions = await deviceFactory.loadContributions();

      expect(contributions).toHaveProperty('activities');
      expect(contributions.activities).toHaveLength(3);
      expect(contributions.activities).toEqual(expect.arrayContaining([
        { ref: 'activity1', type: 'flogo:device:activity' },
        { ref: 'activity2', type: 'flogo:device:activity' },
        { ref: 'activity3', type: 'flogo:device:activity' }
      ]));

      expect(contributions).toHaveProperty('triggers');
      expect(contributions.triggers).toHaveLength(2);
      expect(contributions.triggers).toEqual(expect.arrayContaining([
        { ref: 'trigger1', type: 'flogo:device:trigger' },
        { ref: 'trigger2', type: 'flogo:device:trigger' },
      ]));
    }
  );
});
