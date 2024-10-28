import { NextFunction, Request, Response } from "express";
import ReminderService from "../services/reminder.service";
import { z } from "zod";
import { v4 as uuidV4 } from "uuid";

// Validation schemas
const createReminderSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500),
  timestamp: z.number().int().positive(),
});

const reminderIdSchema = z.object({
  reminderId: z.string().min(1),
});

class ReminderController {
  // Create a new reminder
  createReminder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { title, description, timestamp } = createReminderSchema.parse(
        req.body
      );
      const userId = req.auth.userId;
      const reminderId = uuidV4();

      const reminder = {
        reminderId,
        title,
        description,
        timestamp: String(timestamp),
        userId,
      };

      const success = await ReminderService.addReminder(
        userId,
        reminder,
        timestamp
      );

      if (!success) {
        res.status(500).json({ error: "Failed to create reminder" });
        return;
      }

      res.status(201).json(reminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      next(error);
    }
  };

  // Get all reminders for authenticated user
  getReminders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.auth.userId;
      const reminders = await ReminderService.getAllReminders(userId);
      res.json({
        reminders,
        count: reminders.length,
      });
    } catch (error) {
      console.error("Error getting reminders:", error);
      next(error);
    }
  };

  // Get upcoming reminders
  getUpcomingReminders = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.auth.userId;
      const currentTime = Date.now();
      const reminders = await ReminderService.getUpcomingReminders(
        userId,
        currentTime
      );
      res.json({
        reminders,
        count: reminders.length,
      });
    } catch (error) {
      console.error("Error getting upcoming reminders:", error);
      next(error);
    }
  };

  // Delete a specific reminder
  deleteReminder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.auth.userId;
      const { reminderId } = reminderIdSchema.parse(req.params);

      const deleted = await ReminderService.deleteReminder(userId, reminderId);

      if (!deleted) {
        res.status(404).json({ error: "Reminder not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      next(error);
    }
  };

}

export default new ReminderController();
