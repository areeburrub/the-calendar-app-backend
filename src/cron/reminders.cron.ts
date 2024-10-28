import { schedule } from "node-cron";
import reminderService from "../services/reminder.service";


const startReminderCron = () => {
  // Runs every minute
  schedule("* * * * *", async () => {
    try {
      console.log("Checking and Sending Reminders")
      await reminderService.sendReminderNotifications();
    } catch (error) {
      console.error("Reminder notification failed:", error);
    }
  });
};

export default startReminderCron;
