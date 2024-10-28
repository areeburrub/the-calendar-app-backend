import { createClient, RedisClientType } from "redis";
import { notifyUser } from "./notification.service";
import dotenv from "dotenv";

dotenv.config();

interface ReminderDetails {
  title: string;
  description: string;
}

interface Reminder {
  reminderId: string;
  title: string;
  description: string;
  timestamp: string;
  userId: string;
}

interface UpcomingReminder extends ReminderDetails {
  userId: string;
  reminderId: string;
  timestamp: number;
}

class ReminderService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    // Connect to Redis
    this.client.connect().catch((err: Error) => {
      console.error("Redis connection error:", err);
    });

    // Handle Redis errors
    this.client.on("error", (err: Error) => {
      console.error("Redis client error:", err);
    });
  }

  // Add a new reminder
  async addReminder(
    userId: string,
    reminder: Reminder,
    timestamp: number
  ): Promise<boolean> {
    if (!userId || !reminder || !timestamp) {
      throw new Error("Missing required parameters");
    }

    const key = `user:reminders:${userId}`;
    try {
      await this.client.zAdd(key, {
        score: timestamp,
        value: JSON.stringify(reminder), // Store the complete reminder object
      });
      return true;
    } catch (error) {
      console.error("Error adding reminder:", error);
      throw new Error("Failed to add reminder");
    }
  }

  // Get all reminders for a user
  async getAllReminders(userId: string): Promise<Reminder[]> {
    if (!userId) {
      throw new Error("Missing userId");
    }

    const key = `user:reminders:${userId}`;
    try {
      const reminders = await this.client.zRangeWithScores(key, 0, -1);
      return reminders.map(({ score, value }) => {
        console.log(value);
        const reminder = JSON.parse(value) as Reminder;
        return {
          ...reminder,
          timestamp: String(score), // Convert score back to string for consistency
        };
      });
    } catch (error) {
      console.error("Error fetching reminders:", error);
      throw new Error("Failed to fetch reminders");
    }
  }

  // Get upcoming reminders for a user
  async getUpcomingReminders(
    userId: string,
    currentTime: number
  ): Promise<Reminder[]> {
    const key = `user:reminders:${userId}`;
    try {
      const reminders = await this.client.zRangeWithScores(
        key,
        currentTime,
        "+inf",
        {
          BY: "SCORE",
        }
      );

      return reminders.map(({ score, value }) => {
        const reminder = JSON.parse(value) as Reminder;
        return {
          ...reminder,
          timestamp: String(score),
        };
      });
    } catch (error) {
      console.error("Error fetching upcoming reminders:", error);
      throw new Error("Failed to fetch upcoming reminders");
    }
  }

  // Delete a specific reminder
  async deleteReminder(userId: string, reminderId: string): Promise<boolean> {
    if (!userId || !reminderId) {
      throw new Error("Missing required parameters");
    }

    const key = `user:reminders:${userId}`;
    try {
      // Get all reminders and find the one with matching reminderId
      const reminders = await this.client.zRange(key, 0, -1);
      const reminderToDelete = reminders.find((value) => {
        const reminder = JSON.parse(value) as Reminder;
        return reminder.reminderId === reminderId;
      });

      if (!reminderToDelete) {
        return false;
      }

      const result = await this.client.zRem(key, reminderToDelete);
      return result > 0;
    } catch (error) {
      console.error("Error deleting reminder:", error);
      throw new Error("Failed to delete reminder");
    }
  }

  // Delete all past reminders
  async deletePastReminders(
    userId: string,
    currentTime: number
  ): Promise<number> {
    if (!userId || !currentTime) {
      throw new Error("Missing required parameters");
    }

    const key = `user:reminders:${userId}`;
    try {
      const result = await this.client.zRemRangeByScore(
        key,
        "-inf",
        currentTime
      );
      return result;
    } catch (error) {
      console.error("Error deleting past reminders:", error);
      throw new Error("Failed to delete past reminders");
    }
  }

  // Get reminders due in the next minute
  async getRemindersForNextMinute(): Promise<UpcomingReminder[]> {
    try {
      const currentTime = Date.now() - 30000 ; // 30 seconds before from now
      const oneMinuteFromNow = currentTime + 90000; // 60000 ms = 1.5 minute

      const userKeys = await this.client.keys("user:reminders:*");
      const upcomingReminders: UpcomingReminder[] = [];

      for (const key of userKeys) {
        const userId = key.split(":")[2];
        const reminders = await this.client.zRangeWithScores(
          key,
          currentTime,
          oneMinuteFromNow,
          {
            BY: "SCORE",
          }
        );

        reminders.forEach(({ score, value }) => {
          const reminder = JSON.parse(value) as Reminder;
          upcomingReminders.push({
            userId,
            reminderId: reminder.reminderId,
            timestamp: score,
            title: reminder.title,
            description: reminder.description,
          });
        });
      }

      return upcomingReminders;
    } catch (error) {
      console.error("Error fetching next minute reminders:", error);
      throw new Error("Failed to fetch next minute reminders");
    }
  }

  // Send notifications for upcoming reminders
  async sendReminderNotifications(): Promise<void> {
    try {
      const reminders = await this.getRemindersForNextMinute();

      const notifications = reminders.map(async (reminder) => {
        try {
          await notifyUser(reminder.userId, {
            title: reminder.title,
            description: reminder.description,
            id: reminder.reminderId,
          });

          await this.deleteReminder(reminder.userId, reminder.reminderId);

          console.log(
            `Notification sent for reminder ${reminder.reminderId} to user ${reminder.userId}`
          );
        } catch (error) {
          console.error(
            `Failed to send notification for reminder ${reminder.reminderId}:`,
            error
          );
        }
      });

      await Promise.all(notifications);
    } catch (error) {
      console.error("Error in sendReminderNotifications:", error);
      throw new Error("Failed to process reminder notifications");
    }
  }

  // Clean up resources
  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      console.error("Error disconnecting from Redis:", error);
    }
  }
}

// Export a singleton instance
export default new ReminderService();
