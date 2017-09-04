import {FETCH_CONTEXT} from '../actions';
import _ from 'lodash';


export default function(state = {}, action) {
  // Ultimately, we need to return some kind of object here.
  switch (action.type) {
    case FETCH_CONTEXT:
      const context = action.payload.data;
      return context;
    default:
      return state
  }
}
