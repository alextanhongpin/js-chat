const jwt = require("jsonwebtoken");
const middleware = require("express-jwt");

class Authorizer {
  #secret = "secret";
  #options = {};

  constructor(secret = "secret", options = {}) {
    this.#secret = secret;
    this.#options = {
      expiresIn: "7d",
      ...options
    };
  }

  sign({ username: sub }) {
    return jwt.sign({ sub }, this.#secret, this.#options);
  }

  verify(token) {
    return jwt.verify(token, this.#secret);
  }

  middleware() {
    return middleware({ secret: this.#secret, algorithms: ["HS256"] });
  }
}

module.exports = Authorizer;
