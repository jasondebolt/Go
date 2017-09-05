  let backendHost;
let relativePath;

const hostname = window && window.location && window.location.hostname;

console.log('HOSTNAME IS' + hostname);

if(hostname === 'www.jase.cc') {
  backendHost = 'https://api.jase.cc';
  relativePath = '';
} else if(hostname === 'www.staging.jase.cc') {
  backendHost = 'https://staging.api.jase.cc';
  relativePath = '';
} else if(hostname === 'www.veganolia.com') {
  backendHost = 'https://www.veganolia.com'
  relativePath = '';
} else if(/^qa/.test(hostname)) {
  backendHost = `https://api.${hostname}`;
  relativePath = '';
} else if(hostname == 'z4ru6xjb9f.execute-api.us-west-2.amazonaws.com') {
  backendHost = 'https://z4ru6xjb9f.execute-api.us-west-2.amazonaws.com/dev';
  relativePath = '/dev';
} else {
  backendHost = process.env.REACT_APP_BACKEND_HOST || 'http://127.0.0.1:5000';
  relativePath = '';
}

export const API_ROOT = `${backendHost}/api`;
export const NON_API_ROOT = `${relativePath}`;
