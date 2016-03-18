import * as NetworkStatusActions from  '../actions/networkStatusActions';
import * as PetActions from '../actions/petActions';


const initialState = {
  pets: [],
  networkStatus: navigator.onLine ? 'online' : 'offline'
};

export function rootReducer(state = initialState, action) {

  switch (action.type) {

    case NetworkStatusActions.SET_STATUS:
      return {
        pets: state.pets,
        networkStatus: action.status
      };

    case PetActions.LOAD_PETS:
      return {
        pets : action.pets,
        networkStatus: state.networkStatus
      };

    case PetActions.ADD_PET:
      return {
        pets: state.pets.concat(action.pet),
        networkStatus: state.networkStatus
      };

    case PetActions.MARK_PET_AS_SYNC:
      var pets = state.pets.concat();
      pets[action.index].metadata.isSync = true;
      return {
        pets: pets,
        networkStatus: state.networkStatus
      };


    default:
      return state;

  }

}
