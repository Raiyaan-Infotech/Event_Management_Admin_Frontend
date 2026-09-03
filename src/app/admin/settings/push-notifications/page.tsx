import { PushNotificationConfigContent } from "./_components/push-notification-config-content";

export const metadata = {
  title: "Push Notification Settings | Admin Portal",
  description: "Configure Firebase Cloud Messaging and push notification credentials",
};

export default function PushNotificationSettingsPage() {
  return <PushNotificationConfigContent />;
}
