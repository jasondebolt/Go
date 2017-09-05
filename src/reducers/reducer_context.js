import {FETCH_CONTEXT} from '../actions';
import _ from 'lodash';

function getEmail(obj) {
  if (_.has(obj['user'], 'email')) {
    return obj['user']['email'];
  }
  console.log('User does not have an email');
  return ''
}

export default function(state = {}, action) {
  // Ultimately, we need to return some kind of object here.
  switch (action.type) {
    case FETCH_CONTEXT:
      console.log(action.payload.data);
      return action.payload.data;
      //const context = {
      //  'user': {
      //    'email': action.payload.data.user.email
      //  }
      //}
      //return context;
    default:
      return state
  }
}
