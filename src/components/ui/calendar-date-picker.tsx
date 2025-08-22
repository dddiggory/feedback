"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
} from "date-fns";
import { toDate, formatInTimeZone } from "date-fns-tz";
import { DateRange } from "react-day-picker";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const multiSelectVariants = cva(
  "flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground text-background",
        link: "text-primary underline-offset-4 hover:underline text-background",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface CalendarDatePickerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof multiSelectVariants> {
  date?: DateRange;
  onDateSelect?: (date: DateRange | undefined) => void;
  numberOfMonths?: number;
  disabled?: boolean;
}

const formatWithTz = (date: Date, formatStr: string): string => {
  // Use the user's timezone, or default to UTC
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return formatInTimeZone(date, timeZone, formatStr);
};

const CalendarDatePicker = React.forwardRef<
  HTMLDivElement,
  CalendarDatePickerProps
>(
  (
    {
      className,
      date,
      onDateSelect,
      numberOfMonths = 2,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [monthFrom, setMonthFrom] = React.useState<Date>(
      date?.from || new Date()
    );
    const [yearFrom, setYearFrom] = React.useState<number>(
      date?.from?.getFullYear() || new Date().getFullYear()
    );
    const [monthTo, setMonthTo] = React.useState<Date>(
      date?.to || new Date()
    );
    const [yearTo, setYearTo] = React.useState<number>(
      date?.to?.getFullYear() || new Date().getFullYear()
    );
    const [selectedRange, setSelectedRange] = React.useState<string | null>(
      null
    );
    const [highlightedPart, setHighlightedPart] = React.useState<
      string | null
    >(null);

    // Generate years for dropdown (10 years back and forward)
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: 21 },
      (_, i) => currentYear - 10 + i
    );

    // Predefined date ranges with handy presets
    const dateRanges = React.useMemo(() => {
      const today = new Date();
      return [
        {
          label: "All Time",
          start: undefined, // No start date for all time
          end: undefined,   // No end date for all time
        },
        {
          label: "Today",
          start: startOfDay(today),
          end: endOfDay(today),
        },
        {
          label: "Yesterday",
          start: startOfDay(subDays(today, 1)),
          end: endOfDay(subDays(today, 1)),
        },
        {
          label: "This Week",
          start: startOfWeek(today),
          end: endOfWeek(today),
        },
        {
          label: "Last Week",
          start: startOfWeek(subDays(today, 7)),
          end: endOfWeek(subDays(today, 7)),
        },
        {
          label: "This Month",
          start: startOfMonth(today),
          end: endOfMonth(today),
        },
        {
          label: "Last Month",
          start: startOfMonth(subDays(today, 30)),
          end: endOfMonth(subDays(today, 30)),
        },
        {
          label: "This Year",
          start: startOfYear(today),
          end: endOfYear(today),
        },
        {
          label: "Last Year",
          start: startOfYear(subDays(today, 365)),
          end: endOfYear(subDays(today, 365)),
        },
      ];
    }, []);

    const handleDateSelect = (selectedDate: DateRange | undefined) => {
      if (selectedDate) {
        onDateSelect?.(selectedDate);
        setSelectedRange(null);
      }
    };

    const selectDateRange = (start: Date | undefined, end: Date | undefined, label: string) => {
      const dateRange = start && end ? { from: start, to: end } : undefined;
      onDateSelect?.(dateRange);
      setSelectedRange(label);
      setIsPopoverOpen(false);
    };

    const handleMonthChange = (monthIndex: number, type: "from" | "to") => {
      if (type === "from") {
        const newMonth = new Date(yearFrom, monthIndex);
        setMonthFrom(newMonth);
      } else {
        const newMonth = new Date(yearTo, monthIndex);
        setMonthTo(newMonth);
      }
    };

    const handleYearChange = (year: number, type: "from" | "to") => {
      if (type === "from") {
        setYearFrom(year);
        const newMonth = new Date(year, monthFrom.getMonth());
        setMonthFrom(newMonth);
      } else {
        setYearTo(year);
        const newMonth = new Date(year, monthTo.getMonth());
        setMonthTo(newMonth);
      }
    };

    const handleMouseOver = (part: string) => {
      setHighlightedPart(part);
    };

    const handleMouseLeave = () => {
      setHighlightedPart(null);
    };

    const handleClose = () => {
      setIsPopoverOpen(false);
    };

    return (
      <>
        <div ref={ref} {...props}>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                disabled={disabled}
                variant="outline"
                className={cn(
                  "min-w-[280px] justify-start text-left font-normal cursor-pointer bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground",
                  disabled && "cursor-not-allowed opacity-50",
                  className
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span className="flex">
                  {selectedRange === "All Time" ? (
                    <span>All Time</span>
                  ) : date?.from ? (
                    date.to ? (
                      <>
                        <span
                          id="day"
                          className={cn(
                            "date-part cursor-pointer",
                            highlightedPart === "day" && "underline font-bold"
                          )}
                          onMouseOver={() => handleMouseOver("day")}
                          onMouseLeave={handleMouseLeave}
                        >
                          {formatWithTz(date.from, "dd")}
                        </span>
                        <span className="mx-1">
                          <span
                            id="month"
                            className={cn(
                              "date-part cursor-pointer",
                              highlightedPart === "month" && "underline font-bold"
                            )}
                            onMouseOver={() => handleMouseOver("month")}
                            onMouseLeave={handleMouseLeave}
                          >
                            {formatWithTz(date.from, "LLL")}
                          </span>
                          ,
                        </span>
                        <span
                          id="year"
                          className={cn(
                            "date-part cursor-pointer mr-2",
                            highlightedPart === "year" && "underline font-bold"
                          )}
                          onMouseOver={() => handleMouseOver("year")}
                          onMouseLeave={handleMouseLeave}
                        >
                          {formatWithTz(date.from, "y")}
                        </span>
                        - {formatWithTz(date.to, "dd LLL, y")}
                      </>
                    ) : (
                      <>
                        <span
                          id="day"
                          className={cn(
                            "date-part cursor-pointer",
                            highlightedPart === "day" && "underline font-bold"
                          )}
                          onMouseOver={() => handleMouseOver("day")}
                          onMouseLeave={handleMouseLeave}
                        >
                          {formatWithTz(date.from, "dd")}
                        </span>
                        <span className="mx-1">
                          <span
                            id="month"
                            className={cn(
                              "date-part cursor-pointer",
                              highlightedPart === "month" && "underline font-bold"
                            )}
                            onMouseOver={() => handleMouseOver("month")}
                            onMouseLeave={handleMouseLeave}
                          >
                            {formatWithTz(date.from, "LLL")}
                          </span>
                          ,
                        </span>
                        <span
                          id="year"
                          className={cn(
                            "date-part cursor-pointer",
                            highlightedPart === "year" && "underline font-bold"
                          )}
                          onMouseOver={() => handleMouseOver("year")}
                          onMouseLeave={handleMouseLeave}
                        >
                          {formatWithTz(date.from, "y")}
                        </span>
                      </>
                    )
                  ) : (
                    <span>All Time</span>
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            {isPopoverOpen && (
              <PopoverContent
                className="w-auto"
                align="center"
                avoidCollisions={false}
                onInteractOutside={handleClose}
                onEscapeKeyDown={handleClose}
                style={{
                  maxHeight: "var(--radix-popover-content-available-height)",
                  overflowY: "auto",
                }}
              >
                <div className="flex">
                  {numberOfMonths === 2 && (
                    <div className="hidden md:flex flex-col gap-1 pr-4 text-left border-r border-foreground/10">
                      {dateRanges.map(({ label, start, end }) => (
                        <Button
                          key={label}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "justify-start text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer",
                            selectedRange === label &&
                              "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                          )}
                          onClick={() => {
                            selectDateRange(start, end, label);
                            setMonthFrom(start);
                            setYearFrom(start.getFullYear());
                            setMonthTo(end);
                            setYearTo(end.getFullYear());
                          }}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2 ml-3">
                                              <Select
                        onValueChange={(value) => {
                          handleMonthChange(months.indexOf(value), "from");
                          setSelectedRange(null);
                        }}
                        value={
                          monthFrom ? months[monthFrom.getMonth()] : undefined
                        }
                      >
                        <SelectTrigger className="hidden sm:flex w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                          <SelectContent>
                            {months.map((month, idx) => (
                              <SelectItem key={idx} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                                              <Select
                        onValueChange={(value) => {
                          handleYearChange(Number(value), "from");
                          setSelectedRange(null);
                        }}
                        value={yearFrom ? yearFrom.toString() : undefined}
                      >
                        <SelectTrigger className="hidden sm:flex w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                          <SelectContent>
                            {years.map((year, idx) => (
                              <SelectItem key={idx} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {numberOfMonths === 2 && (
                        <div className="flex gap-2">
                                                  <Select
                          onValueChange={(value) => {
                            handleMonthChange(months.indexOf(value), "to");
                            setSelectedRange(null);
                          }}
                          value={
                            monthTo ? months[monthTo.getMonth()] : undefined
                          }
                        >
                          <SelectTrigger className="hidden sm:flex w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                            <SelectContent>
                              {months.map((month, idx) => (
                                <SelectItem key={idx} value={month}>
                                  {month}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                                                  <Select
                          onValueChange={(value) => {
                            handleYearChange(Number(value), "to");
                            setSelectedRange(null);
                          }}
                          value={yearTo ? yearTo.toString() : undefined}
                        >
                          <SelectTrigger className="hidden sm:flex w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                            <SelectContent>
                              {years.map((year, idx) => (
                                <SelectItem key={idx} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <Calendar
                        mode="range"
                        defaultMonth={monthFrom}
                        month={monthFrom}
                        onMonthChange={setMonthFrom}
                        selected={date}
                        onSelect={handleDateSelect}
                        numberOfMonths={numberOfMonths}
                        showOutsideDays={false}
                        className={className}
                      />
                      <div className="text-xs text-muted-foreground text-center mt-2 px-3 pb-2">
                        Double-click a date to set a new range start date
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            )}
          </Popover>
        </div>
      </>
    );
  }
);

CalendarDatePicker.displayName = "CalendarDatePicker";

export { CalendarDatePicker };
