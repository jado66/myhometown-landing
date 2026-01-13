import { BulkMMSMessaging } from "@/components/communications/bulk-mms-messaging";

export default function SendMessagesPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Send Messages</h1>
        <p className="text-muted-foreground mt-2">
          Send text messages to contacts, users, and communities
        </p>
      </div>
      <BulkMMSMessaging />
    </div>
  );
}
