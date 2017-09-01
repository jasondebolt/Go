import axios from 'axios';
export const FETCH_LINKS = 'fetch_links';
export const CREATE_LINK = 'create_link';
export const FETCH_LINK = 'fetch_link';
export const DELETE_LINK = 'delete_link';

const ROOT_URL = 'http://reduxblog.herokuapp.com/api'
// Use Postman to manually create some links.
const API_KEY = '?key=JASON9999' // Choose any random key.

export function fetchLinks() {
  const request = axios.get(`${ROOT_URL}/posts${API_KEY}`)
  return {
    type: FETCH_LINKS,
    payload: request
  };
}

export function createLink(values, callback) {
  // OLD VERSION
  //const request = axios.post(`${ROOT_URL}/links${API_KEY}`, values);

  // new version will callback which contains promise to back back to main page
  // after request axios promise is resolved.
  const request = axios.post(`${ROOT_URL}/posts${API_KEY}`, values).then(
    () => callback());

  return {
    type: CREATE_LINK,
    payload: request
  }
}

export function fetchLink(id) {
  const request = axios.get(`${ROOT_URL}/posts/${id}${API_KEY}`)

  return {
    type: FETCH_LINK,
    payload: request
  }
}

export function deleteLink(id, callback) {
  const request = axios.delete(`${ROOT_URL}/posts/${id}${API_KEY}`).then(
    () => callback());

  return {
    type: DELETE_LINK,
    payload: request
  }
}
