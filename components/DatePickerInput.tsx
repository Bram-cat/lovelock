import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignSystem, gradients } from '../constants/DesignSystem';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';

interface DatePickerInputProps {
  value: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  label?: string;
}

export default function DatePickerInput({ 
  value, 
  onDateChange, 
  placeholder = "MM/DD/YYYY",
  label = "Birth Date"
}: DatePickerInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 25);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1);

  // Update inputValue when value prop changes
  useEffect(() => {
    console.log('DatePickerInput: value prop changed to:', value);
    setInputValue(value);
  }, [value]);

  // Format input as user types
  const formatInput = (text: string): string => {
    // Remove all non-numeric characters
    const numbers = text.replace(/\D/g, '');
    
    // Format as MM/DD/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  // Validate date
  const validateDate = (dateStr: string): boolean => {
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return false;
    
    const month = parseInt(match[1]);
    const day = parseInt(match[2]);
    const year = parseInt(match[3]);
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > new Date().getFullYear()) return false;
    
    // Check for valid day in month
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  // Handle text input change
  const handleInputChange = (text: string) => {
    const formatted = formatInput(text);
    setInputValue(formatted);
    
    // If complete date, validate and update
    if (formatted.length === 10) {
      if (validateDate(formatted)) {
        onDateChange(formatted);
      }
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    if (inputValue.length === 10) {
      if (validateDate(inputValue)) {
        onDateChange(inputValue);
      } else {
        Alert.alert('Invalid Date', 'Please enter a valid date in MM/DD/YYYY format.');
        setInputValue('');
      }
    }
  };

  // Generate years for picker
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  };

  // Generate days for selected month/year
  const generateDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  // Handle calendar date selection
  const handleCalendarSelect = () => {
    // Validate that year has been selected first
    if (selectedYear === new Date().getFullYear() - 25) {
      Alert.alert('Year Required', 'Please select a year first, then select the month and day.');
      return;
    }
    
    const month = (selectedMonth + 1).toString().padStart(2, '0');
    const day = selectedDay.toString().padStart(2, '0');
    const dateStr = `${month}/${day}/${selectedYear}`;
    
    setInputValue(dateStr);
    onDateChange(dateStr);
    setShowCalendar(false);
  };

  // Handle month selection - alert if year not selected first
  const handleMonthSelect = (monthIndex: number) => {
    if (selectedYear === new Date().getFullYear() - 25) {
      Alert.alert('Select Year First', 'Please select a year first before selecting the month.');
      return;
    }
    setSelectedMonth(monthIndex);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <View style={styles.container}>
      {/* Beautiful Input Field */}
      <GlassCard intensity="medium" style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.inputTouchable}
          onPress={() => setShowCalendar(true)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="calendar" 
            size={DesignSystem.typography.sizes['2xl']} 
            color={DesignSystem.colors.primary.solidPurple} 
            style={styles.inputIcon} 
          />
          <View style={styles.inputContent}>
            <Text style={[styles.inputValue, !inputValue && styles.placeholderValue]}>
              {inputValue || placeholder}
            </Text>
          </View>
          <Ionicons 
            name="chevron-down" 
            size={DesignSystem.typography.sizes.lg} 
            color={DesignSystem.colors.primary.solidPurple} 
          />
        </TouchableOpacity>
      </GlassCard>

      {/* Beautiful Modal Date Picker */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard intensity="strong" tint="dark" style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowCalendar(false)}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Birth Date</Text>
                <View style={styles.placeholder} />
              </View>

              {/* Date Selection Content */}
              <View style={styles.dateSelectionContainer}>
                {/* Month Selector */}
                <View style={styles.selectorSection}>
                  <Text style={styles.selectorTitle}>Month</Text>
                  <ScrollView 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.monthScrollView}
                    contentContainerStyle={styles.monthScrollContent}
                  >
                    {months.map((month, index) => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.monthItem,
                          selectedMonth === index && styles.selectedItem
                        ]}
                        onPress={() => handleMonthSelect(index)}
                      >
                        <Text style={[
                          styles.monthText,
                          selectedMonth === index && styles.selectedText
                        ]}>
                          {month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Year Selector */}
                <View style={styles.selectorSection}>
                  <Text style={styles.selectorTitle}>Year</Text>
                  <ScrollView 
                    style={styles.yearScrollView}
                    showsVerticalScrollIndicator={true}
                    indicatorStyle="white"
                  >
                    <View style={styles.yearContainer}>
                      {Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <TouchableOpacity
                          key={year}
                          style={[
                            styles.yearItem,
                            selectedYear === year && styles.selectedItem
                          ]}
                          onPress={() => setSelectedYear(year)}
                        >
                          <Text style={[
                            styles.yearText,
                            selectedYear === year && styles.selectedText
                          ]}>
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Day Selector */}
                <View style={styles.selectorSection}>
                  <Text style={styles.selectorTitle}>Day</Text>
                  <ScrollView 
                    style={styles.dayScrollView}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.dayContainer}>
                      {generateDays().map((day) => (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.dayItem,
                            selectedDay === day && styles.selectedItem
                          ]}
                          onPress={() => setSelectedDay(day)}
                        >
                          <Text style={[
                            styles.dayText,
                            selectedDay === day && styles.selectedText
                          ]}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <Button
                  title="Confirm Date"
                  onPress={handleCalendarSelect}
                  variant="primary"
                  icon="checkmark"
                />
              </View>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 0,
  },
  inputTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.scale.lg,
    paddingVertical: DesignSystem.spacing.scale.lg,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: DesignSystem.spacing.scale.lg,
  },
  inputContent: {
    flex: 1,
  },
  inputValue: {
    fontSize: DesignSystem.typography.sizes.base,
    fontWeight: DesignSystem.typography.weights.medium,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
  },
  placeholderValue: {
    color: DesignSystem.colors.text.muted,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignSystem.spacing.scale.xl,
  },
  modalContainer: {
    width: '100%',
    height: 600,
    marginBottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignSystem.spacing.scale['2xl'],
    paddingTop: DesignSystem.spacing.scale.xl,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalTitle: {
    fontSize: DesignSystem.typography.sizes['2xl'],
    fontWeight: DesignSystem.typography.weights.bold,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  // Date Selection Styles
  dateSelectionContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  selectorSection: {
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: DesignSystem.typography.sizes.lg,
    fontWeight: DesignSystem.typography.weights.bold,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.scale.lg,
    textAlign: 'center',
  },
  // Month Selector
  monthScrollView: {
    maxHeight: 60,
  },
  monthScrollContent: {
    paddingHorizontal: 10,
  },
  monthItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 100,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Year Selector
  yearScrollView: {
    maxHeight: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingVertical: 10,
  },
  yearContainer: {
    paddingHorizontal: 10,
  },
  yearItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  yearText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  // Day Selector
  dayScrollView: {
    maxHeight: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingVertical: 10,
  },
  dayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  dayItem: {
    width: 45,
    height: 45,
    margin: 3,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Selected States
  selectedItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  selectedText: {
    color: '#6a1b9a',
    fontWeight: 'bold',
  },
  // Action Buttons
  actionButtons: {
    alignItems: 'center',
    marginTop: DesignSystem.spacing.scale.lg,
    paddingBottom: DesignSystem.spacing.scale.xl,
  },
});
