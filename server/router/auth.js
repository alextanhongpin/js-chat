const Router = require("express").Router;
const defined = require("../module/defined");

function createAuthRouter(authorizer) {
  defined({ authorizer });

  const router = Router();

  router.post("/login", (req, res) => {
    const { username } = req.body;
    defined({ username });

    res.status(200).json({
      accessToken: authorizer.sign({ username })
    });
  });

  return router;
}

module.exports = createAuthRouter;
