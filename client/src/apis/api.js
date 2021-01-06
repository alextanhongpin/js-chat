export const api = path =>
  `http://localhost:${process.env.REACT_APP_PORT || 3000}${path}`;

export const withAuthz = (headers = {}) => ({
  ...headers,
  Authorization: `Bearer ${window.localStorage.getItem("accessToken")}`
});
