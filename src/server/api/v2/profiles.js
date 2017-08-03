import {profiles as mockProfiles} from '../mockdata/mock-profiles';

export function profiles(router, basePath) {
  router.get(`${basePath}/profiles`, listProfiles);
}

function* listProfiles(){
  this.body = {
    data: mockProfiles.data,
  };
}
