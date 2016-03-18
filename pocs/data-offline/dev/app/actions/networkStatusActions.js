export const SET_STATUS  = 'SET_STATUS';


export class NetworkStatusActions {
  constructor() {
  }

  setStatus(status) {
      return {
        type: SET_STATUS,
        status: status
      }
  }

}
