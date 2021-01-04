import { Socket } from "socket.io";

export default type CustomSocket = Socket & {
  user: {
    sub: string
  },
  handshake: {
    headers: {
      authorization: string
    }
  }
}
