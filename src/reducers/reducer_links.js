// Note that we don't have to specify a file because we are importing from index.js
// See https://nodejs.org/dist/latest-v7.x/docs/api/modules.html#modules_folders_as_modules

/*
If there is no package.json file present in the directory, then Node.js will
attempt to load an index.js or index.node file out of that directory.
For example, if there was no package.json file in the above example,
then require('./some-library') would attempt to load:

./some-library/index.js
./some-library/index.node
*/
import {FETCH_LINKS, FETCH_LINK, DELETE_LINK} from '../actions';
import _ from 'lodash';


// We don't have a case for the CREATE_LINK action because
// for that action we use another promise with a callback to automatically
// redirect back to the main page after the ajax promise is resolved.
// When the main page is hit, react router renders LinkIndex.
export default function(state = {}, action) {
  // Ultimately, we need to return some kind of object here.
  switch (action.type) {
    case FETCH_LINK:
      // We really don't want to throw away all of our existing links.
      // Show, let's take all of the existing links on the client '...state',
      // take them all out that state object and put them all into this new
      // object in return. Then, on tops of that, we'll add a new key/value
      // pair.

      const link = action.payload.data;
      let newState = { ...state };
      newState[link.id] = link;
      return newState;

      // This does hte same thing as the above code.
      // The square braces do not create an array. This does key interpolation.
      // It makes a new key on this object for whatever the value of
      // action.payload.data.id is, setting it's value to action.payload.data.
      // It sort of accumulates links over time.

      //return { ...state, [action.payload.data.id]: action.payload.data};
    case FETCH_LINKS:
      console.log(action.payload.data); // [link1, link2, link3, ...]
      // We want { alias: link, ...}
      return _.mapKeys(action.payload.data, 'alias');
    case DELETE_LINK:
      return _.omit(state, action.payload);
    default:
      return state
  }
}
