import React from "react";
import { Calendar } from "react-native-calendars";
import { format, parseISO } from "date-fns";
import colors from "../../constants/colors";

const CalendarSelector = ({ schedules, selectedDate, onDayPress, TRAINING_TYPES }) => {
  const markedDates = schedules.reduce((acc, schedule) => {
    const date = format(parseISO(schedule.scheduled_at), "yyyy-MM-dd");
    acc[date] = {
      marked: true,
      dotColor: TRAINING_TYPES[schedule.training_type].color,
      selected: date === selectedDate,
    };
    return acc;
  }, { [selectedDate]: { selected: true } });
  
  return (
    <Calendar
      current={selectedDate}
      onDayPress={onDayPress}
      markedDates={markedDates}
      theme={{
        selectedDayBackgroundColor: colors.primary,
        todayTextColor: colors.primary,
        arrowColor: colors.primary,
        monthTextColor: colors.textDark,
        textMonthFontWeight: "bold",
        textDayFontSize: 14,
        textMonthFontSize: 16,
      }}
    />
  );
};

export default CalendarSelector;
