import { Request, Response } from "express";
import {
  subscribeUser,
} from "../services/notification.service";

export const subscribe = (req: Request, res: Response) => {
  const subscription = req.body;
  subscribeUser(subscription, req.auth.userId);
  res.status(201).json({ status: "success" });
};