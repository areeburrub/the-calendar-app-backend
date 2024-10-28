import webpush from "web-push";
import prisma from "../prisma";

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY as string,
  privateKey: process.env.VAPID_PRIVATE_KEY as string,
};

webpush.setVapidDetails(
  "mailto:areeburrub@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export const subscribeUser = async (subscription: any, userId: string) => {
  try {
    // Save subscription to the database
    await prisma.subscription.create({
      data: {
        userId: userId,
        subscriptionData: subscription,
      },
    });
  } catch (error) {
    console.error("Error saving subscription:", error);
  }
};

export const notifyUser = async (
  userId: string,
  payload: { title: string; description: string; id: string }
) => {
  const notificationPayload = JSON.stringify(payload);

  try {
    // Fetch subscriptions for the user from the database
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      console.log("No subscriptions found for this user.");
      return { success: false, message: "No subscriptions found." };
    }

    // Send notifications to all fetched subscriptions
    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            // @ts-ignore
            subscription.subscriptionData,
            notificationPayload
          );
        } catch (e) {}
      })
    );

    return { success: true, message: "Notification sent successfully." };
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new Error("Failed to send notification");
  }
};
