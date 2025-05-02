import admin from '../config/firebaseAdmin';

interface NotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
}

export async function sendPushNotification(
  fcmToken: string,
  payload: NotificationPayload
): Promise<void> {
  const message = {
    token: fcmToken,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.data || {},
  };

  await admin.messaging().send(message);
} 