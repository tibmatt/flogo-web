import sinon from 'sinon';
import { expect } from 'chai';
import { DeviceAppImporterFactory } from './factory';

describe('importer.device.factory', function () {
  const sandbox = sinon.createSandbox();
  const deviceFactory = new DeviceAppImporterFactory({});
  it('should classify contributions into activities and triggers', async function () {
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

    expect(contributions).to.have.property('activities')
      .of.length(3)
      .that.deep.contains({ ref: 'activity1', type: 'flogo:device:activity' })
      .and.deep.contains({ ref: 'activity2', type: 'flogo:device:activity' })
      .and.deep.contains({ ref: 'activity3', type: 'flogo:device:activity' });

    expect(contributions).to.have.property('triggers')
      .of.length(2)
      .that.deep.contains({ ref: 'trigger1', type: 'flogo:device:trigger' })
      .and.deep.contains({ ref: 'trigger2', type: 'flogo:device:trigger' });
  });
});
