import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock } from "lucide-react";
import { CronExpressionParser } from "cron-parser";
import { format } from "date-fns";

interface CronParts {
  minutes: string;
  hours: string;
  dayOfMonth: string;
  months: string;
  dayOfWeek: string;
}

const CronJobParser: React.FC = () => {
  const [cronExpression, setCronExpression] = useState<string>("");
  const [cronParts, setCronParts] = useState<CronParts | null>(null);
  const [nextExecutions, setNextExecutions] = useState<Date[]>([]);
  const [error, setError] = useState<string>("");

  const parseCronExpression = useCallback((expression: string) => {
    if (!expression.trim()) {
      setCronParts(null);
      setNextExecutions([]);
      setError("");
      return;
    }

    try {
      setError("");
      
      // Parse the cron expression
      const parsedExpression = CronExpressionParser.parse(expression);
      
      // Split the expression into parts
      const parts = expression.trim().split(/\s+/);
      if (parts.length !== 5) {
        throw new Error("Cron expression must have exactly 5 fields");
      }

      setCronParts({
        minutes: parts[0],
        hours: parts[1],
        dayOfMonth: parts[2],
        months: parts[3],
        dayOfWeek: parts[4]
      });

      // Calculate next 10 execution times
      const executions: Date[] = [];
      const interval = CronExpressionParser.parse(expression);
      
      for (let i = 0; i < 10; i++) {
        executions.push(interval.next().toDate());
      }
      
      setNextExecutions(executions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid cron expression");
      setCronParts(null);
      setNextExecutions([]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCronExpression(value);
  };

  const handleInspect = () => {
    parseCronExpression(cronExpression);
  };

  const formatCronField = (field: string, type: string): string => {
    if (field === "*") return "Every " + type.toLowerCase();
    if (field.includes("/")) {
      const [range, step] = field.split("/");
      return `Every ${step} ${type.toLowerCase()}${range !== "*" ? ` within ${range}` : ""}`;
    }
    if (field.includes("-")) {
      return `${type} ${field}`;
    }
    if (field.includes(",")) {
      return `${type} ${field.replace(/,/g, ", ")}`;
    }
    return `${type} ${field}`;
  };

  const getFieldDescription = (value: string, fieldType: string): string => {
    switch (fieldType) {
      case "minutes":
        return formatCronField(value, "minute");
      case "hours":
        return formatCronField(value, "hour");
      case "dayOfMonth":
        return formatCronField(value, "day of month");
      case "months":
        return formatCronField(value, "month");
      case "dayOfWeek":
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        if (value === "*") return "Every day of week";
        if (value.includes(",")) {
          return value.split(",").map(d => dayNames[parseInt(d)] || d).join(", ");
        }
        if (value.includes("-")) {
          const [start, end] = value.split("-");
          return `${dayNames[parseInt(start)] || start} to ${dayNames[parseInt(end)] || end}`;
        }
        return dayNames[parseInt(value)] || value;
      default:
        return value;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cron Expression Parser
          </CardTitle>
          <CardDescription>
            Enter a cron expression to parse it and see when it will execute
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cron-input">Cron Expression</Label>
            <div className="flex gap-2">
              <Input
                id="cron-input"
                type="text"
                placeholder="0 0 * * 1"
                value={cronExpression}
                onChange={handleInputChange}
                className="font-mono"
              />
              <Button 
                onClick={handleInspect}
                variant="outline"
                className="px-4"
              >
                Inspect
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Format: minute hour day-of-month month day-of-week
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {cronParts && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">MINUTES</Label>
                <div className="p-2 bg-muted rounded-md">
                  <div className="font-mono text-sm">{cronParts.minutes}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getFieldDescription(cronParts.minutes, "minutes")}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">HOURS</Label>
                <div className="p-2 bg-muted rounded-md">
                  <div className="font-mono text-sm">{cronParts.hours}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getFieldDescription(cronParts.hours, "hours")}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">DAY OF MONTH</Label>
                <div className="p-2 bg-muted rounded-md">
                  <div className="font-mono text-sm">{cronParts.dayOfMonth}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getFieldDescription(cronParts.dayOfMonth, "dayOfMonth")}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">MONTHS</Label>
                <div className="p-2 bg-muted rounded-md">
                  <div className="font-mono text-sm">{cronParts.months}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getFieldDescription(cronParts.months, "months")}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">DAY OF WEEK</Label>
                <div className="p-2 bg-muted rounded-md">
                  <div className="font-mono text-sm">{cronParts.dayOfWeek}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {getFieldDescription(cronParts.dayOfWeek, "dayOfWeek")}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {nextExecutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Next 10 Executions</CardTitle>
            <CardDescription>
              Upcoming execution times for this cron expression
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nextExecutions.map((date, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                >
                  <span className="text-sm font-medium">#{index + 1}</span>
                  <span className="font-mono text-sm">
                    {format(date, "yyyy-MM-dd HH:mm:ss")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(date, "EEE")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CronJobParser;