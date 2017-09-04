import axios from 'axios';
export const FETCH_CONTEXT = 'fetch_context';
export const FETCH_LINKS = 'fetch_links';
export const PUT_LINK = 'put_link';
export const FETCH_LINK = 'fetch_link';
export const DELETE_LINK = 'delete_link';

//const ROOT_URL = 'http://reduxblog.herokuapp.com/api'
const ROOT_URL = '/api'

export function fetchContext() {
  const request = axios.get(`${ROOT_URL}/context`)
  return {
    type: FETCH_CONTEXT,
    payload: request
  };
}

export function fetchLinks() {
  const request = axios.get(`${ROOT_URL}/links`)
  return {
    type: FETCH_LINKS,
    payload: request
  };
}

export function putLink(values, successCallback, errorCallback) {
  // OLD VERSION
  //const request = axios.post(`${ROOT_URL}/links${API_KEY}`, values);

  // new version will callback which contains promise to back back to main page
  // after request axios promise is resolved.
  const request = axios.put(`${ROOT_URL}/links`, values)
    .then((response) => successCallback(response))
    .catch((response) => errorCallback(response))

  return {
    type: PUT_LINK,
    payload: request
  }
}

export function fetchLink(alias) {
  const request = axios.get(`${ROOT_URL}/links/${alias}`)

  return {
    type: FETCH_LINK,
    payload: request
  }
}

export function deleteLink(alias, callback) {
  const request = axios.delete(`${ROOT_URL}/links/${alias}`).then(
    () => callback());

  return {
    type: DELETE_LINK,
    payload: request
  }
}
