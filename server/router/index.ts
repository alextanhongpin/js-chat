import { Application, Request, Response } from "express";
import Authorizer from "../usecase/authz";
import createAuthRouter from "./auth";

export default function createRouter({
  app,
  authorizer
}: {
  app: Application;
  authorizer: Authorizer;
}) {
  app.use("/auth", createAuthRouter(authorizer));
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
      ok: true
    });
  });
}
