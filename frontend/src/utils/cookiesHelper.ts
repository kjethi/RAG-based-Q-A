import Cookies from 'universal-cookie';

export const getCookie = (cookieName: string) => {
  const cookies = new Cookies();
  return cookies.get(cookieName);
};

export const setCookie = (cookieName: string, value:unknown) => {
  const cookies = new Cookies();
  return cookies.set(cookieName, value);
};

export const removeCookie = (cookieName: string) => {
  const cookies = new Cookies();
  cookies.remove(cookieName, { path: '/' });
  console.log("remove cookie");
};

export const removeAuthCookies = () => {
  removeCookie('access_token');
};

export const setAuthCookies = (access_token: string) => {
  setCookie('access_token', access_token);
};
