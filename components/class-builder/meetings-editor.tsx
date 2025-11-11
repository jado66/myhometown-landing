"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { Meeting } from "@/types/classes";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type MeetingsEditorProps = {
  meetings: Meeting[];
  onChange: (meetings: Meeting[]) => void;
};

export function MeetingsEditor({ meetings, onChange }: MeetingsEditorProps) {
  const handleAdd = () => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      day: "Monday",
      startTime: "09:00",
      endTime: "10:00",
    };
    onChange([...meetings, newMeeting]);
  };

  const handleUpdate = (id: string, field: keyof Meeting, value: string) => {
    onChange(meetings.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleDelete = (id: string) => {
    onChange(meetings.filter((m) => m.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Meetings</CardTitle>
        <CardDescription>
          Set up the weekly schedule for this class
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {meetings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No meetings scheduled yet</p>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Meeting
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-end gap-3 p-4 border rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={meeting.day}
                    onValueChange={(value) =>
                      handleUpdate(meeting.id, "day", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={meeting.startTime}
                    onChange={(e) =>
                      handleUpdate(meeting.id, "startTime", e.target.value)
                    }
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={meeting.endTime}
                    onChange={(e) =>
                      handleUpdate(meeting.id, "endTime", e.target.value)
                    }
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(meeting.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              onClick={handleAdd}
              variant="outline"
              className="w-full bg-transparent"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Meeting
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
