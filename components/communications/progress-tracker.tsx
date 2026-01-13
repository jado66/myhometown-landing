"use client";

import { useState, useEffect } from "react";
import {
  Check,
  X,
  Clock,
  Send,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface MessageResult {
  phone: string;
  status:
    | "sent"
    | "delivered"
    | "failed"
    | "undelivered"
    | "pending"
    | "queued";
  sid?: string;
  error?: string;
  isTestNumber?: boolean;
}

interface MessageSummary {
  total: number;
  successful: number;
  failed: number;
  results: MessageResult[];
}

interface ApiResponse {
  success: boolean;
  error?: string;
  summary: MessageSummary;
}

interface ProgressState {
  total: number;
  sent: number;
  failed: number;
  error?: string;
}

interface ProgressTrackerProps {
  sendStatus: "idle" | "sending" | "completed" | "error";
  progress: ProgressState;
  onReset?: () => void;
  apiResponse?: ApiResponse | null;
}

const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "Unknown";
  const cleaned = phone.replace(/^\+1/, "").replace(/^\+/, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }
  return phone;
};

const getStatusIcon = (status: string, isTest = false) => {
  if (isTest) {
    return <AlertTriangle className="h-4 w-4 text-warning" />;
  }

  switch (status) {
    case "sent":
    case "delivered":
      return <Check className="h-4 w-4 text-success" />;
    case "failed":
    case "undelivered":
      return <X className="h-4 w-4 text-destructive" />;
    case "pending":
    case "queued":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    default:
      return <Send className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadgeVariant = (
  status: string,
  isTest = false
): "default" | "secondary" | "destructive" | "outline" => {
  if (isTest) return "secondary";

  switch (status) {
    case "sent":
    case "delivered":
      return "default";
    case "failed":
    case "undelivered":
      return "destructive";
    default:
      return "secondary";
  }
};

export function ProgressTracker({
  sendStatus,
  progress,
  onReset,
  apiResponse,
}: ProgressTrackerProps) {
  const [expanded, setExpanded] = useState(false);
  const [detailedResults, setDetailedResults] = useState<MessageResult[]>([]);

  useEffect(() => {
    if (apiResponse?.summary?.results) {
      setDetailedResults(apiResponse.summary.results);
    }
  }, [apiResponse]);

  if (sendStatus === "idle") return null;

  // Sending state
  if (sendStatus === "sending") {
    const percentage =
      progress.total > 0 ? (progress.sent / progress.total) * 100 : 0;

    return (
      <Card className="mt-6 mx-6 mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <h3 className="text-lg font-semibold">
              Sending {progress.total || 0} message
              {progress.total !== 1 ? "s" : ""}...
            </h3>
          </div>
          <Progress value={percentage} className="h-2 mb-2" />
          <p className="text-sm text-center text-muted-foreground">
            Please wait while we process your messages
          </p>
        </CardContent>
      </Card>
    );
  }

  // Completed state
  if (sendStatus === "completed" && apiResponse) {
    const summary = apiResponse.summary || {};
    const realResults = detailedResults.filter((r) => !r.isTestNumber);
    const testResults = detailedResults.filter((r) => r.isTestNumber);
    const sentCount = realResults.filter((r) => r.status === "sent").length;
    const failedCount = realResults.filter((r) => r.status === "failed").length;

    return (
      <Card className="mt-6 mx-6 mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Message Results</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="flex flex-wrap gap-2">
            {sentCount > 0 && (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                {sentCount} Sent Successfully
              </Badge>
            )}
            {failedCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <X className="h-3 w-3" />
                {failedCount} Failed
              </Badge>
            )}
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertDescription className="text-sm space-y-2">
              <p className="font-semibold">Status Meanings:</p>
              <div className="text-xs space-y-1">
                <p>
                  <strong>Sent</strong> - Message was successfully handed off to
                  the Texting Provider.{" "}
                  <strong>This does not guarantee delivery.</strong>
                </p>
                <p>
                  Delivery depends on: recipient&apos;s carrier, phone status,
                  DND settings, etc.
                </p>
                <p>
                  <strong>Failed</strong> - Invalid number, carrier issue, or
                  recipient opted out.
                </p>
                <p>
                  <strong>Delivery Status</strong> - Check Texting Logs for
                  final delivery status.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Test Numbers Alert */}
          {testResults.length > 0 && (
            <Alert>
              <AlertDescription className="text-sm">
                {testResults.length} test number
                {testResults.length !== 1 ? "s were" : " was"} included for
                system validation
              </AlertDescription>
            </Alert>
          )}

          {/* Detailed Results */}
          <Collapsible open={expanded} onOpenChange={setExpanded}>
            <CollapsibleContent className="space-y-4">
              <Separator />

              {/* Real Recipients */}
              {realResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">
                    Recipients ({realResults.length})
                  </h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {realResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <p className="font-mono text-sm">
                              {formatPhoneNumber(result.phone)}
                            </p>
                            {result.error && (
                              <p className="text-xs text-destructive mt-1">
                                {result.error}
                              </p>
                            )}
                            {result.sid && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ID: {result.sid.substring(0, 10)}...
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Numbers */}
              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">
                    Test Numbers (System Validation)
                  </h4>
                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status, true)}
                          <div>
                            <p className="font-mono text-sm">{result.phone}</p>
                            <p className="text-xs text-muted-foreground">
                              Expected failure - Invalid test number
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Test</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailedResults.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No detailed results available
                  </p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (sendStatus === "error") {
    return (
      <Card className="mt-6 mx-6 mb-6 border-destructive">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold">
                An error occurred while sending messages
              </p>
              {progress.error && (
                <p className="text-sm mt-1">{progress.error}</p>
              )}
            </AlertDescription>
          </Alert>
          {onReset && (
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={onReset}>
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
