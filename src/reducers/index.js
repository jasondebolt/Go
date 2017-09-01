import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import LinkReducer from './reducer_links';

const rootReducer = combineReducers({
  links: LinkReducer,
  form: formReducer
});

export default rootReducer;
