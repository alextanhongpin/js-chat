import jwt from "jsonwebtoken";
import middleware from "express-jwt";

export default class Authorizer {
  #secret = "secret";
  #options = {};

  constructor(secret = "secret", options = {}) {
    this.#secret = secret;
    this.#options = {
      expiresIn: "7d",
      ...options
    };
  }

  sign({ username: sub }: { username: string }): string {
    return jwt.sign({ sub }, this.#secret, this.#options);
  }

  verify(token: string) {
    return jwt.verify(token, this.#secret);
  }

  middleware() {
    return middleware({ secret: this.#secret, algorithms: ["HS256"] });
  }
}
