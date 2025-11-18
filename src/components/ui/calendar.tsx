import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-0 hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-800/40 dark:hover:to-blue-800/40 border-purple-200 dark:border-purple-700 transition-all",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-center",
        head_cell: "text-muted-foreground rounded-md w-10 font-semibold text-xs uppercase",
        row: "flex w-full mt-2 justify-center",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-purple-100/50 dark:[&:has([aria-selected].day-outside)]:bg-purple-900/20 [&:has([aria-selected])]:bg-gradient-to-r [&:has([aria-selected])]:from-purple-100 [&:has([aria-selected])]:to-blue-100 dark:[&:has([aria-selected])]:from-purple-900/30 dark:[&:has([aria-selected])]:to-blue-900/30 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-10 w-10 p-0 font-medium aria-selected:opacity-100 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gradient-to-br from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:from-purple-700 focus:to-blue-700 shadow-md font-bold",
        day_today: "bg-purple-100 dark:bg-purple-900/30 font-bold text-purple-900 dark:text-purple-100 ring-2 ring-purple-500 ring-offset-2",
        day_outside:
          "day-outside text-muted-foreground opacity-40 aria-selected:bg-purple-100/50 dark:aria-selected:bg-purple-900/20 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-30",
        day_range_middle: "aria-selected:bg-gradient-to-r aria-selected:from-purple-100 aria-selected:to-blue-100 dark:aria-selected:from-purple-900/30 dark:aria-selected:to-blue-900/30 aria-selected:text-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
