import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';

export default function UnixTimeConverter() {
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [customTimestamp, setCustomTimestamp] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [timeInput, setTimeInput] = useState<string>('');
  const [isUpdatingFromTimestamp, setIsUpdatingFromTimestamp] = useState(false);
  const [isUpdatingFromDateTime, setIsUpdatingFromDateTime] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client flag and update current timestamp every second
  useEffect(() => {
    setIsClient(true);
    const updateCurrentTime = () => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    };
    
    updateCurrentTime(); // Initial call
    const interval = setInterval(updateCurrentTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Initialize with current time only once, after client is ready
  useEffect(() => {
    if (isClient) {
      const now = new Date();
      const initialTimestamp = Math.floor(Date.now() / 1000);
      setCustomTimestamp(initialTimestamp.toString());
      setSelectedDate(now);
      setTimeInput(formatTimeForInput(now));
    }
  }, [isClient]);

  const formatTimeForInput = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleTimestampChange = (value: string) => {
    setCustomTimestamp(value);
    
    if (!isUpdatingFromDateTime) {
      setIsUpdatingFromTimestamp(true);
      
      const timestamp = parseInt(value);
      if (!isNaN(timestamp) && timestamp > 0) {
        const date = new Date(timestamp * 1000);
        setSelectedDate(date);
        setTimeInput(formatTimeForInput(date));
      }
      
      setTimeout(() => setIsUpdatingFromTimestamp(false), 100);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    updateTimestampFromDateTime(date, timeInput);
  };

  const handleTimeChange = (time: string) => {
    setTimeInput(time);
    updateTimestampFromDateTime(selectedDate, time);
  };

  const updateTimestampFromDateTime = (date: Date | undefined, time: string) => {
    if (!isUpdatingFromTimestamp && date) {
      setIsUpdatingFromDateTime(true);
      
      const [hours, minutes, seconds] = time.split(':').map(Number);
      const combinedDate = new Date(date);
      combinedDate.setHours(hours || 0, minutes || 0, seconds || 0, 0);
      
      if (!isNaN(combinedDate.getTime())) {
        const timestamp = Math.floor(combinedDate.getTime() / 1000);
        setCustomTimestamp(timestamp.toString());
      }
      
      setTimeout(() => setIsUpdatingFromDateTime(false), 100);
    }
  };

  const formatHumanReadable = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getTimestampForDisplay = (): number => {
    const custom = parseInt(customTimestamp);
    return !isNaN(custom) && custom > 0 ? custom : currentTimestamp;
  };

  return (
    <div className="space-y-6">
      {/* Current Unix Timestamp */}
      <Card>
        <CardHeader>
          <CardTitle>Current Unix Timestamp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-primary">
                {isClient ? currentTimestamp : '---'}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {isClient ? formatHumanReadable(currentTimestamp) : 'Loading...'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Timestamp Input */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Unix Timestamp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customTimestamp">Unix Timestamp</Label>
              <Input
                id="customTimestamp"
                type="number"
                value={customTimestamp}
                onChange={(e) => handleTimestampChange(e.target.value)}
                placeholder="Enter Unix timestamp"
                className="font-mono"
              />
            </div>
            {customTimestamp && !isNaN(parseInt(customTimestamp)) && parseInt(customTimestamp) > 0 && (
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm font-medium text-muted-foreground mb-1">Human Readable:</div>
                <div className="text-sm">
                  {formatHumanReadable(parseInt(customTimestamp))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Input */}
      <Card>
        <CardHeader>
          <CardTitle>Date & Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                <Label className="px-1">
                  Date
                </Label>
                <DatePicker
                  date={selectedDate}
                  setDate={handleDateChange}
                  placeholder="Select date"
                  className="w-48"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="time-picker" className="px-1">
                  Time
                </Label>
                <Input
                  type="time"
                  id="time-picker"
                  step="1"
                  value={timeInput}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none font-mono"
                />
              </div>
            </div>
            {selectedDate && timeInput && (
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm font-medium text-muted-foreground mb-1">Unix Timestamp:</div>
                <div className="text-sm font-mono">
                  {(() => {
                    const [hours, minutes, seconds] = timeInput.split(':').map(Number);
                    const combinedDate = new Date(selectedDate);
                    combinedDate.setHours(hours || 0, minutes || 0, seconds || 0, 0);
                    return Math.floor(combinedDate.getTime() / 1000);
                  })()}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Unix Timestamps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Unix timestamp represents the number of seconds since January 1, 1970, 00:00:00 UTC (Unix Epoch).
            </p>
            <p>
              This converter automatically synchronizes between timestamp and date/time formats as you type.
            </p>
            <ul className="list-disc list-inside space-y-1 mt-3">
              <li>Current timestamp updates every second</li>
              <li>Enter any timestamp to see its human-readable date</li>
              <li>Pick any date/time to get its Unix timestamp</li>
              <li>All times are displayed in your local timezone</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}