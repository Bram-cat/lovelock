import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '../../constants/DesignSystem';
import Dropdown from './Dropdown';

interface ShadcnCalendarProps {
  value?: Date;
  onSelect: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  inline?: boolean;
}

const { width } = Dimensions.get('window');

export default function ShadcnCalendar({
  value,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
  maxDate = new Date(),
  inline = false
}: ShadcnCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setCurrentMonth(value);
    }
  }, [value]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleMonthChange = (monthIndex: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(monthIndex);
    setCurrentMonth(newMonth);
  };

  const handleYearChange = (year: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(year);
    setCurrentMonth(newMonth);
  };

  const generateMonthOptions = () => {
    return months.map((month, index) => ({
      label: month,
      value: index,
    }));
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100; // 100 years back
    const endYear = currentYear + 10; // 10 years forward
    
    const years = [];
    for (let year = endYear; year >= startYear; year--) {
      years.push({
        label: year.toString(),
        value: year,
      });
    }
    return years;
  };

  const selectDate = (date: Date) => {
    if (isDateDisabled(date)) return;
    setSelectedDate(date);
    onSelect(date);
    setIsOpen(false);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell}>
          <View style={styles.emptyDay} />
        </View>
      );
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const disabled = isDateDisabled(date);
      const selected = isDateSelected(date);
      const today = isToday(date);

      days.push(
        <Pressable
          key={day}
          style={({ pressed }) => [
            styles.dayCell,
            pressed && !disabled && styles.dayPressed,
          ]}
          onPress={() => selectDate(date)}
          disabled={disabled}
        >
          <View
            style={[
              styles.dayButton,
              selected && styles.selectedDay,
              today && !selected && styles.todayDay,
              disabled && styles.disabledDay,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                selected && styles.selectedDayText,
                today && !selected && styles.todayDayText,
                disabled && styles.disabledDayText,
              ]}
            >
              {day}
            </Text>
          </View>
        </Pressable>
      );
    }

    return days;
  };

  const renderVerticalCalendarDays = (weekDayIndex: number) => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Calculate which days belong to this column (weekDayIndex)
    // Start from the first week and add days that fall on this weekday
    
    // Add empty cells for the beginning of the month if needed
    const startOffset = (weekDayIndex - firstDay + 7) % 7;
    let dayNumber = 1 - startOffset;

    // Continue until we've gone past the month
    while (dayNumber <= daysInMonth + 6) {
      if (dayNumber >= 1 && dayNumber <= daysInMonth) {
        // Valid day of the month
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber);
        const disabled = isDateDisabled(date);
        const selected = isDateSelected(date);
        const today = isToday(date);

        days.push(
          <Pressable
            key={dayNumber}
            style={({ pressed }) => [
              styles.verticalDayCell,
              selected && styles.selectedDay,
              today && !selected && styles.todayDay,
              disabled && styles.disabledDay,
              pressed && !disabled && styles.dayPressed,
            ]}
            onPress={() => !disabled && selectDate(date)}
            disabled={disabled}
          >
            <View
              style={[
                styles.verticalDayInner,
                selected && styles.selectedDayInner,
                today && !selected && styles.todayDayInner,
              ]}
            >
              <Text
                style={[
                  styles.verticalDayText,
                  selected && styles.selectedDayText,
                  today && !selected && styles.todayDayText,
                  disabled && styles.disabledDayText,
                ]}
              >
                {dayNumber}
              </Text>
            </View>
          </Pressable>
        );
      } else {
        // Empty cell for days outside the month
        days.push(
          <View key={`empty-${dayNumber}`} style={styles.verticalDayCell}>
            <View style={styles.emptyVerticalDay} />
          </View>
        );
      }
      dayNumber += 7; // Move to the same weekday next week
    }

    return days;
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return placeholder;
    return selectedDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // If inline mode, render calendar directly without trigger or modal
  if (inline) {
    return (
      <View style={styles.inlineCalendarWrapper}>
        <View style={styles.calendarContainer}>
          {/* Calendar Header with Dropdowns */}
          <View style={styles.calendarHeader}>
            <View style={styles.dropdownContainer}>
              <Dropdown
                options={generateMonthOptions()}
                value={currentMonth.getMonth()}
                onSelect={(monthIndex) => handleMonthChange(monthIndex as number)}
                placeholder="Month"
              />
            </View>
            
            <View style={styles.dropdownContainer}>
              <Dropdown
                options={generateYearOptions()}
                value={currentMonth.getFullYear()}
                onSelect={(year) => handleYearChange(year as number)}
                placeholder="Year"
              />
            </View>
          </View>

          {/* Optional: Keep navigation arrows for quick month changes */}
          <View style={styles.quickNavigation}>
            <TouchableOpacity 
              onPress={() => navigateMonth('prev')}
              style={styles.quickNavButton}
            >
              <Ionicons name="chevron-back" size={18} color="#a1a1aa" />
              <Text style={styles.quickNavText}>Prev Month</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => navigateMonth('next')}
              style={styles.quickNavButton}
            >
              <Text style={styles.quickNavText}>Next Month</Text>
              <Ionicons name="chevron-forward" size={18} color="#a1a1aa" />
            </TouchableOpacity>
          </View>

          {/* Vertical Calendar Layout */}
          <View style={styles.verticalCalendarContainer}>
            {weekDays.map((weekDay, weekIndex) => (
              <View key={weekDay} style={styles.verticalDayColumn}>
                {/* Day of week header */}
                <View style={styles.verticalWeekDayHeader}>
                  <Text style={styles.verticalWeekDayText}>{weekDay}</Text>
                </View>
                
                {/* Days column */}
                <View style={styles.verticalDaysColumn}>
                  {renderVerticalCalendarDays(weekIndex)}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <>
      {/* Trigger Button - Shadcn style */}
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          disabled && styles.disabledTrigger,
          pressed && !disabled && styles.triggerPressed,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <View style={styles.triggerContent}>
          <View style={styles.triggerLeft}>
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={disabled ? '#71717a' : '#a1a1aa'} 
              style={styles.triggerIcon}
            />
            <Text 
              style={[
                styles.triggerText,
                !selectedDate && styles.placeholderText,
                disabled && styles.disabledText
              ]}
            >
              {formatSelectedDate()}
            </Text>
          </View>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={disabled ? '#71717a' : '#a1a1aa'} 
          />
        </View>
      </Pressable>

      {/* Calendar Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            style={styles.calendarContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.calendar}>
              {/* Header */}
              <View style={styles.header}>
                <Pressable
                  style={({ pressed }) => [
                    styles.navButton,
                    pressed && styles.navButtonPressed,
                  ]}
                  onPress={() => navigateMonth('prev')}
                >
                  <Ionicons name="chevron-back" size={16} color="#f4f4f5" />
                </Pressable>

                <Text style={styles.monthYear}>
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.navButton,
                    pressed && styles.navButtonPressed,
                  ]}
                  onPress={() => navigateMonth('next')}
                >
                  <Ionicons name="chevron-forward" size={16} color="#f4f4f5" />
                </Pressable>
              </View>

              {/* Week days */}
              <View style={styles.weekDays}>
                {weekDays.map((day) => (
                  <View key={day} style={styles.weekDayCell}>
                    <Text style={styles.weekDayText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Calendar grid */}
              <View style={styles.daysGrid}>
                {renderCalendarDays()}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

ShadcnCalendar.displayName = 'ShadcnCalendar';

const styles = StyleSheet.create({
  // Trigger button styles - Shadcn inspired
  trigger: {
    borderWidth: 1,
    borderColor: '#27272a', // border-zinc-800
    backgroundColor: 'transparent',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    // Subtle shadow like Shadcn
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  triggerPressed: {
    backgroundColor: '#18181b', // accent hover
  },
  disabledTrigger: {
    opacity: 0.5,
    backgroundColor: '#09090b', // background muted
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  triggerIcon: {
    marginRight: 8,
  },
  triggerText: {
    flex: 1,
    fontSize: 14,
    color: '#f4f4f5', // foreground
    fontWeight: '400',
  },
  placeholderText: {
    color: '#a1a1aa', // muted-foreground
  },
  disabledText: {
    color: '#71717a',
  },

  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  calendarContainer: {
    backgroundColor: '#09090b', // popover background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272a', // border
    maxWidth: width - 32,
    width: '100%',
    // Shadcn popover shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  calendar: {
    padding: 16,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  navButtonPressed: {
    backgroundColor: '#18181b',
  },
  monthYear: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f4f4f5',
  },

  // Week days
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71717a', // muted-foreground
  },

  // Days grid
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 2,
  },
  dayPressed: {
    opacity: 0.8,
  },
  emptyDay: {
    width: 32,
    height: 32,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  selectedDay: {
    backgroundColor: '#f4f4f5', // primary
  },
  todayDay: {
    borderWidth: 1,
    borderColor: '#f4f4f5',
    backgroundColor: '#18181b',
  },
  disabledDay: {
    opacity: 0.5,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#f4f4f5',
  },
  selectedDayText: {
    color: '#09090b', // primary-foreground
    fontWeight: '500',
  },
  todayDayText: {
    color: '#f4f4f5',
    fontWeight: '500',
  },
  disabledDayText: {
    color: '#71717a',
  },
  // Inline calendar styles
  inlineCalendarWrapper: {
    backgroundColor: '#09090b',
    borderRadius: 8,
    overflow: 'hidden',
  },
  calendarContainer: {
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  dropdownContainer: {
    flex: 1,
  },
  quickNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  quickNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(161, 161, 170, 0.1)',
  },
  quickNavText: {
    fontSize: 12,
    color: '#a1a1aa',
    marginHorizontal: 4,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f4f4f5',
  },
  
  // Vertical calendar styles
  verticalCalendarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 1,
    paddingHorizontal: 2,
  },
  verticalDayColumn: {
    flex: 1,
    alignItems: 'center',
    minWidth: 45,
  },
  verticalWeekDayHeader: {
    paddingVertical: 6,
    marginBottom: 6,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  verticalWeekDayText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#a1a1aa',
    textTransform: 'uppercase',
  },
  verticalDaysColumn: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    gap: 3,
    paddingBottom: 8,
  },
  verticalDayCell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  verticalDayInner: {
    width: 34,
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  verticalDayText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#f4f4f5',
  },
  selectedDayInner: {
    backgroundColor: '#f4f4f5',
  },
  todayDayInner: {
    borderWidth: 1,
    borderColor: '#f4f4f5',
    backgroundColor: '#18181b',
  },
  emptyVerticalDay: {
    width: 34,
    height: 34,
  },
});