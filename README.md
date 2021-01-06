# js-chat

To test for multi-node, run two servers and two clients, and open incognito or different browsers. If the same user is on different browser, the messages should be received by them.

```bash
# Starting multiple servers.
cd /server
PORT=4000 yarn start
PORT=5000 yarn start

# Starting multiple clients (note that the CORS is set to client port 3000 and 3001 only)
cd /client
REACT_APP_PORT=4000 yarn start (connect to server with port *:4000), running port *:3000
REACT_APP_PORT=5000 yarn start (connect to server with port *:5000), running port *:3001
```
