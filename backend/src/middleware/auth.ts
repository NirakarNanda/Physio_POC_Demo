import type { NextFunction, Request, Response } from "express";

// Session type augmentation for express-session.
declare module "express-session" {
  interface SessionData {
    user?: { name: string; email: string };
  }
}

export interface AuthedRequest extends Request {
  session: Request["session"] & { user?: { name: string; email: string } };
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const session = req.session as unknown as { user?: { name: string; email: string } };
  if (session?.user?.email) {
    next();
    return;
  }
  res.status(401).json({ ok: false, message: "Not authenticated" });
}
