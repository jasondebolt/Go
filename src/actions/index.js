import axios from 'axios';
import { API_URL } from '../constants';
export const FETCH_CONTEXT = 'fetch_context';
export const FETCH_LINKS = 'fetch_links';
export const PUT_LINK = 'put_link';
export const FETCH_LINK = 'fetch_link';
export const DELETE_LINK = 'delete_link';

export function fetchContext() {
  const request = axios.get(`${API_URL}/context`)
  return {
    type: FETCH_CONTEXT,
    payload: request
  };
}

export function fetchLinks() {
  const request = axios.get(`${API_URL}/links`)
  return {
    type: FETCH_LINKS,
    payload: request
  };
}

export function putLink(values, successCallback, errorCallback) {
  // new version will callback which contains promise to back back to main page
  // after request axios promise is resolved.
  const request = axios.put(`${API_URL}/links`, values)
    .then((response) => successCallback(response))
    .catch((response) => errorCallback(response))

  return {
    type: PUT_LINK,
    payload: request
  }
}

export function fetchLink(alias) {
  const request = axios.get(`${API_URL}/links/${alias}`)

  return {
    type: FETCH_LINK,
    payload: request
  }
}

export function deleteLink(alias, successCallback, errorCallback) {
  const request = axios.delete(`${API_URL}/links/${alias}`)
    .then((response) => successCallback(response))
    .catch((response) => errorCallback(response))

  return {
    type: DELETE_LINK,
    payload: request
  }
}
