export const api = path => `http://localhost:3000${path}`;

export const withAuthz = (headers = {}) => ({
  ...headers,
  Authorization: `Bearer ${window.localStorage.getItem("accessToken")}`
});

