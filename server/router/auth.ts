import { Router, Request, Response } from "express";
import defined from "../module/defined";
import Authorizer from "../usecase/authz";
import CustomRequest from "../types/request";

export default function createAuthRouter(authorizer: Authorizer) {
  defined({ authorizer });

  const router = Router();

  router.post("/login", (req: Request, res: Response) => {
    const { username } = req.body;
    defined({ username });

    res.status(200).json({
      accessToken: authorizer.sign({ username })
    });
  });

  router.post(
    "/authorize",
    authorizer.middleware(),
    (req: CustomRequest, res: Response) => {
      const { sub: username } = req.user;
      return res.status(200).json({
        username
      });
    }
  );

  return router;
}
