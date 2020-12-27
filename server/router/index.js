const createAuthRouter = require("./auth");

function createRouter({ app, authorizer }) {
  app.use("/auth", createAuthRouter(authorizer));
  app.get("/health", (req, res) => {
    res.status(200).json({
      ok: true
    });
  });
}

module.exports = createRouter;
