import {createStore} from '../lib/redux';
import {rootReducer} from '../reducers/rootReducer';


export let appStore = createStore(rootReducer);

export class AppStore {
}


