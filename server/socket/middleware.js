const defined = require("../module/defined");

function createMiddleware(authorizer) {
  defined({ authorizer });

  // Authorization middleware with jwt.
  function authorize(socket, next) {
    const auth = socket.handshake.headers.authorization;
    const token = auth.replace("Bearer ", "");
    if (!token) {
      return next(new Error("Missing Authorization header"));
    }

    socket.user = authorizer.verify(token);
    next();
  }

  return {
    authorize
  };
}

module.exports = createMiddleware;
