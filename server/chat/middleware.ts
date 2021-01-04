import CustomSocket from '../types/socket'
import defined from "../module/defined";
import Authorizer from "../usecase/authz";

type Next = (err?: Error) => void;

export default function createMiddleware(authorizer: Authorizer) {
  defined({ authorizer });

  // Authorization middleware with jwt.
  function authorize(socket: CustomSocket, next: Next) {
    const auth = socket?.handshake?.headers?.authorization ?? '';
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
