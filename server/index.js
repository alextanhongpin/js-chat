const express = require("express");
const cors = require("cors");
const http = require("http");

const createRouter = require("./router");
const createSocket = require("./socket");

// UseCases.
const Authorizer = require("./usecase/authz");

// Environment variables.
const PORT = process.env.PORT || 3000;

async function main() {
  const app = express();

  app.use(cors());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Init usecases.
  const authorizer = new Authorizer();

  createRouter({
    app,
    authorizer
  });
  const server = http.createServer(app);

  createSocket({ server, authorizer });

  server.listen(PORT, () => {
    console.log(`listening on port *:${PORT}. press ctrl + c to cancel.`);
  });
}

main().catch(console.error);
