import { ImportsRefAgent } from '../extensions';
import { toActualReference } from '@flogo-web/server/core';

describe('@flogo-web/server/core: toActualReference', () => {
  const mockRefs = new Map<string, string>([
    ['log', 'dummy_ref_to_contrib/log'],
    ['oldReturn', 'github.com/TIBCOSoftware/flogo-contrib/activity/actreturn'],
    ['newReturn', 'github.com/project-flogo/contrib/activity/actreturn'],
  ]);

  const mockAgent: ImportsRefAgent = {
    getRef: ref => mockRefs.get(ref),
  };

  it('Should return the full reference as it is', () => {
    expect(toActualReference('dummy_contrib_path/contrib', mockAgent)).toEqual(
      'dummy_contrib_path/contrib'
    );
  });

  it('Should return the alias with its reference', () => {
    expect(toActualReference('#log', mockAgent)).toEqual('dummy_ref_to_contrib/log');
    expect(toActualReference('#newReturn', mockAgent)).toEqual(
      'github.com/project-flogo/contrib/activity/actreturn'
    );
  });

  it('Should return the old special contrib with its new reference', () => {
    expect(toActualReference('#oldReturn', mockAgent)).toEqual(
      'github.com/project-flogo/contrib/activity/actreturn'
    );
    expect(
      toActualReference(
        'github.com/TIBCOSoftware/flogo-contrib/activity/actreturn',
        mockAgent
      )
    ).toEqual('github.com/project-flogo/contrib/activity/actreturn');
  });
});
