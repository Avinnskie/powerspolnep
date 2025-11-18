"use client";

import * as React from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, parse } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  includeTime?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  className,
  disabled = false,
  includeTime = true,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [timeValue, setTimeValue] = React.useState<string>(
    value ? format(value, "HH:mm") : "09:00",
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange?.(undefined);
      return;
    }

    if (includeTime && timeValue) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      onChange?.(newDate);
    } else {
      onChange?.(selectedDate);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);
    if (value && newTime) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange?.(newDate);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            <>
              {format(value, "PPP", { locale: idLocale })}
              {includeTime && (
                <>
                  <Clock className="ml-2 mr-1 h-3 w-3" />
                  {format(value, "HH:mm")}
                </>
              )}
            </>
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          disabled={(date) =>
            disabled || date < new Date(new Date().setHours(0, 0, 0, 0))
          }
          initialFocus
        />
        {includeTime && (
          <div className="border-t p-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <label className="text-sm font-medium">Waktu:</label>
              <input
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface DatePickerProps extends Omit<DateTimePickerProps, "includeTime"> {}

export function DatePicker(props: DatePickerProps) {
  return <DateTimePicker {...props} includeTime={false} />;
}
