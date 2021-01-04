import { Request } from "express";

export default type CustomRequest = Request & {
  user: {
    sub: string;
  };
};
