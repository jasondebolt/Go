import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import LinkReducer from './reducer_links';
import ContextReducer from './reducer_context';

const rootReducer = combineReducers({
  links: LinkReducer,
  form: formReducer,
  context: ContextReducer
});

export default rootReducer;
