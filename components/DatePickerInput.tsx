import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
    const month = (selectedMonth + 1).toString().padStart(2, '0');
    const day = selectedDay.toString().padStart(2, '0');
    const dateStr = `${month}/${day}/${selectedYear}`;
    
    setInputValue(dateStr);
    onDateChange(dateStr);
    setShowCalendar(false);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <View style={styles.container}>
      {/* Beautiful Input Field */}
      <TouchableOpacity 
        style={styles.inputContainer}
        onPress={() => setShowCalendar(true)}
      >
        <LinearGradient
          colors={['rgba(106, 27, 154, 0.1)', 'rgba(233, 30, 99, 0.1)']}
          style={styles.inputGradient}
        >
          <Ionicons name="calendar" size={24} color="#6a1b9a" style={styles.inputIcon} />
          <View style={styles.inputContent}>
            <Text style={styles.inputValue}>
              {inputValue || placeholder}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#6a1b9a" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Beautiful Modal Date Picker */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.modalGradient}
            >
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
                        onPress={() => setSelectedMonth(index)}
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
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleCalendarSelect}
                >
                  <Text style={styles.confirmButtonText}>Confirm Date</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  // Beautiful Input Field Styles
  inputContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6a1b9a',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(106, 27, 154, 0.3)',
    borderRadius: 16,
  },
  inputIcon: {
    marginRight: 15,
  },
  inputContent: {
    flex: 1,
  },
  inputValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d1b69',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    height: 600,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalGradient: {
    height: '100%',
    padding: 20,
    justifyContent: 'space-between',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
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
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6a1b9a',
    textAlign: 'center',
  },
});
