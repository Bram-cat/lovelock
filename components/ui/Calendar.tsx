import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '../../constants/DesignSystem';

interface CalendarProps {
  value?: Date;
  onSelect: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const { width } = Dimensions.get('window');

export default function Calendar({
  value,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
  maxDate = new Date()
}: CalendarProps) {
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
        <TouchableOpacity
          key={day}
          style={styles.dayCell}
          onPress={() => selectDate(date)}
          disabled={disabled}
          activeOpacity={0.7}
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
        </TouchableOpacity>
      );
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

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, disabled && styles.disabledTrigger]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={styles.triggerContent}>
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={disabled ? DesignSystem.colors.text.muted : DesignSystem.colors.primary.solidPurple} 
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
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={disabled ? DesignSystem.colors.text.muted : DesignSystem.colors.text.secondary} 
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <TouchableOpacity
            style={styles.calendarContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.calendar}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => navigateMonth('prev')}
                >
                  <Ionicons name="chevron-back" size={20} color={DesignSystem.colors.text.primary} />
                </TouchableOpacity>

                <Text style={styles.monthYear}>
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>

                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => navigateMonth('next')}
                >
                  <Ionicons name="chevron-forward" size={20} color={DesignSystem.colors.text.primary} />
                </TouchableOpacity>
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

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.todayButton}
                  onPress={() => {
                    const today = new Date();
                    if (!isDateDisabled(today)) {
                      setCurrentMonth(today);
                      selectDate(today);
                    }
                  }}
                >
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Trigger button styles
  trigger: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: DesignSystem.borderRadius.md,
    paddingHorizontal: DesignSystem.spacing.scale.lg,
    paddingVertical: DesignSystem.spacing.scale.lg,
    minHeight: 48,
  },
  disabledTrigger: {
    opacity: 0.5,
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    flex: 1,
    fontSize: DesignSystem.typography.sizes.base,
    color: DesignSystem.colors.text.primary,
    marginLeft: DesignSystem.spacing.scale.md,
  },
  placeholderText: {
    color: DesignSystem.colors.text.muted,
  },
  disabledText: {
    color: DesignSystem.colors.text.muted,
  },

  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing.scale.xl,
  },
  calendarContainer: {
    backgroundColor: DesignSystem.colors.backgrounds.cardDark,
    borderRadius: DesignSystem.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...DesignSystem.shadows.xl,
    maxWidth: width - 40,
    width: '100%',
  },
  calendar: {
    padding: DesignSystem.spacing.scale.xl,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.scale.xl,
  },
  navButton: {
    padding: DesignSystem.spacing.scale.sm,
    borderRadius: DesignSystem.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  monthYear: {
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.semibold,
    color: DesignSystem.colors.text.primary,
  },

  // Week days
  weekDays: {
    flexDirection: 'row',
    marginBottom: DesignSystem.spacing.scale.md,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.scale.sm,
  },
  weekDayText: {
    fontSize: DesignSystem.typography.sizes.xs,
    fontWeight: DesignSystem.typography.weights.medium,
    color: DesignSystem.colors.text.muted,
  },

  // Days grid
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: DesignSystem.spacing.scale.xl,
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.scale.sm,
  },
  emptyDay: {
    width: 32,
    height: 32,
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: DesignSystem.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  selectedDay: {
    backgroundColor: DesignSystem.colors.primary.solidPurple,
  },
  todayDay: {
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary.solidPurple,
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.medium,
    color: DesignSystem.colors.text.primary,
  },
  selectedDayText: {
    color: DesignSystem.colors.text.primary,
    fontWeight: DesignSystem.typography.weights.semibold,
  },
  todayDayText: {
    color: DesignSystem.colors.primary.solidPurple,
    fontWeight: DesignSystem.typography.weights.semibold,
  },
  disabledDayText: {
    color: DesignSystem.colors.text.muted,
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: DesignSystem.spacing.scale.lg,
    alignItems: 'center',
  },
  todayButton: {
    paddingHorizontal: DesignSystem.spacing.scale.lg,
    paddingVertical: DesignSystem.spacing.scale.sm,
    borderRadius: DesignSystem.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  todayButtonText: {
    fontSize: DesignSystem.typography.sizes.sm,
    fontWeight: DesignSystem.typography.weights.medium,
    color: DesignSystem.colors.text.primary,
  },
});