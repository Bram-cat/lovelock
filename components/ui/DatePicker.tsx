import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  Pressable,
  StyleSheet,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ShadcnCalendar from './ShadcnCalendar';

interface DatePickerProps {
  value?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  label?: string;
  error?: string;
}

export default function DatePicker({
  value,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
  maxDate = new Date(),
  label,
  error
}: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    onSelect?.(date);
    setShowCalendar(false);
  };

  const handleToggleCalendar = () => {
    if (!disabled) {
      setShowCalendar(!showCalendar);
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      {/* Calendar Toggle Button */}
      <Pressable
        onPress={handleToggleCalendar}
        disabled={disabled}
        style={[
          styles.calendarToggle,
          disabled && styles.disabled,
          error && styles.error,
          showCalendar && styles.calendarToggleActive
        ]}
      >
        <View style={styles.toggleContent}>
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color="#E91E63"
            style={styles.calendarIcon}
          />
          <Text style={styles.calendarToggleText}>
            {showCalendar ? 'Hide Calendar' : 'Select Date'}
          </Text>
        </View>
      </Pressable>

      {/* Inline Calendar */}
      {showCalendar && (
        <View style={styles.inlineCalendarContainer}>
          <ShadcnCalendar
            value={value}
            onSelect={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
            placeholder={placeholder}
            inline={true}
          />
        </View>
      )}

      {/* Selected Date Display */}
      {value && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateLabel}>Selected Date:</Text>
          <Text style={styles.selectedDate}>
            {(value.getMonth() + 1).toString().padStart(2, '0')}/
            {value.getDate().toString().padStart(2, '0')}/
            {value.getFullYear()}
          </Text>
        </View>
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

DatePicker.displayName = 'DatePicker';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f4f4f5',
    marginBottom: 8,
  },
  calendarToggle: {
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    backgroundColor: 'rgba(233, 30, 99, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  calendarToggleActive: {
    borderColor: '#E91E63',
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    shadowColor: '#E91E63',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarIcon: {
    marginRight: 8,
  },
  calendarToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E91E63',
  },
  inlineCalendarContainer: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    backgroundColor: '#09090b',
    overflow: 'hidden',
    // Enhanced shadow for the calendar
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedDateContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(233, 30, 99, 0.3)',
  },
  selectedDateLabel: {
    fontSize: 12,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E91E63',
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#09090b',
  },
  error: {
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    lineHeight: 16,
  },
});