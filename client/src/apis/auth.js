import { api, withAuthz } from "apis/api";

export async function login({ username }) {
  const response = await window.fetch(api("/auth/login"), {
    method: "POST",
    body: JSON.stringify({
      username
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  const { accessToken } = await response.json();
  return accessToken;
}

export async function authorize() {
  const response = await window.fetch(api("/auth/authorize"), {
    method: "POST",
    headers: withAuthz({
      "Content-Type": "application/json"
    })
  });
  const { username } = await response.json();
  return username;
}
