"use client";

import { useState, useMemo } from "react";
import { Send, Calendar, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Recipient {
  id: string;
  name: string;
  phone: string;
}

interface MediaFile {
  file: File;
  preview: string;
}

interface ReviewAndSendProps {
  recipients: Recipient[];
  message: string;
  media: MediaFile[];
  recipientCount: number;
  onSend: (scheduledTime?: Date) => void;
  sending: boolean;
  disabled?: boolean;
  sectionSizes?: Map<string, number>;
}

const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const calculateEstimatedTime = (recipientCount: number): string => {
  // Twilio typical throughput: ~1 msg/sec, add buffer for MMS processing
  const estimatedSeconds = Math.ceil(recipientCount * 1.5);
  if (estimatedSeconds < 60) return `~${estimatedSeconds} seconds`;
  const minutes = Math.ceil(estimatedSeconds / 60);
  return `~${minutes} minute${minutes !== 1 ? "s" : ""}`;
};

const calculateCost = (recipientCount: number, hasMedia: boolean): string => {
  // Approximate Twilio rates: SMS $0.0079, MMS $0.02
  const perMessageCost = hasMedia ? 0.02 : 0.0079;
  const total = recipientCount * perMessageCost;
  return `$${total.toFixed(2)}`;
};

export function ReviewAndSend({
  recipients,
  message,
  media,
  recipientCount,
  onSend,
  sending,
  disabled = false,
  sectionSizes,
}: ReviewAndSendProps) {
  const [scheduling, setScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [confirmScheduled, setConfirmScheduled] = useState(false);

  const hasMedia = media.length > 0;
  const messageType = hasMedia ? "MMS" : "SMS";
  const characterCount = message.length;
  const segmentCount = Math.ceil(characterCount / 160);

  const estimatedTime = useMemo(
    () => calculateEstimatedTime(recipientCount),
    [recipientCount]
  );

  const estimatedCost = useMemo(
    () => calculateCost(recipientCount, hasMedia),
    [recipientCount, hasMedia]
  );

  const now = useMemo(() => new Date(), []);
  const minDate = now.toISOString().split("T")[0];
  const minTime = now.toTimeString().slice(0, 5);

  const isValidSchedule = (): boolean => {
    if (!scheduledDate || !scheduledTime) return false;
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    return scheduledDateTime > now;
  };

  const handleSendNow = () => {
    onSend();
  };

  const handleScheduleSend = () => {
    if (!isValidSchedule()) return;
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    onSend(scheduledDateTime);
  };

  const canSend = recipientCount > 0 && message.trim().length > 0 && !disabled;
  const canSchedule = canSend && isValidSchedule() && confirmScheduled;

  // Calculate active sections
  const activeSections = useMemo(() => {
    if (!sectionSizes) return 0;
    let count = 0;
    sectionSizes.forEach((size) => {
      if (size > 0) count++;
    });
    return count;
  }, [sectionSizes]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Send</CardTitle>
        <CardDescription>
          Verify your message details before sending
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Message Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Message Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium">{messageType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Recipients</p>
              <p className="font-medium">{recipientCount}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Characters</p>
              <p className="font-medium">
                {characterCount} ({segmentCount} segment
                {segmentCount !== 1 ? "s" : ""})
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Media Files</p>
              <p className="font-medium">{media.length}</p>
            </div>
          </div>

          {activeSections > 0 && (
            <Alert>
              <AlertDescription className="text-sm">
                Sending {activeSections} section
                {activeSections !== 1 ? "s" : ""} with {recipientCount} total
                recipient{recipientCount !== 1 ? "s" : ""}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Separator />

        {/* Message Preview */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Message Preview</h4>
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm whitespace-pre-wrap">
              {message || "(No message)"}
            </p>
            {media.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {media.map((m, idx) => (
                  <Badge key={idx} variant="outline">
                    📎 {m.file.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Scheduling Options */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Scheduling</h4>
            <Button
              variant={scheduling ? "secondary" : "outline"}
              size="sm"
              onClick={() => setScheduling(!scheduling)}
              disabled={!canSend}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {scheduling ? "Cancel Schedule" : "Schedule Send"}
            </Button>
          </div>

          {scheduling && (
            <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-date">Date</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    min={minDate}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule-time">Time</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    min={scheduledDate === minDate ? minTime : undefined}
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              {scheduledDate && scheduledTime && isValidSchedule() && (
                <Alert>
                  <AlertDescription className="text-sm">
                    Message will be sent on{" "}
                    <strong>
                      {formatDateTime(
                        new Date(`${scheduledDate}T${scheduledTime}`)
                      )}
                    </strong>
                  </AlertDescription>
                </Alert>
              )}

              {scheduledDate && scheduledTime && !isValidSchedule() && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Scheduled time must be in the future
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-start gap-2">
                <Checkbox
                  id="confirm-schedule"
                  checked={confirmScheduled}
                  onCheckedChange={(checked) =>
                    setConfirmScheduled(checked === true)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="confirm-schedule"
                    className="text-sm font-normal cursor-pointer"
                  >
                    I confirm the scheduled send time is correct
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Scheduled messages cannot be cancelled once queued
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!scheduling ? (
            <Button
              className="flex-1"
              onClick={handleSendNow}
              disabled={!canSend || sending}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Now to {recipientCount} Recipient
                  {recipientCount !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={handleScheduleSend}
              disabled={!canSchedule || sending}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Send
                </>
              )}
            </Button>
          )}
        </div>

        {/* Warnings */}
        {recipientCount > 100 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Large batch detected ({recipientCount} recipients). Estimated send
              time: {estimatedTime}
            </AlertDescription>
          </Alert>
        )}

        {segmentCount > 1 && (
          <Alert>
            <AlertDescription className="text-sm">
              This message will be sent as {segmentCount} segments per recipient
              due to length
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
