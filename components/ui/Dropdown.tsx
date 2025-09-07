import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string | number;
  onSelect: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  maxHeight?: number;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onSelect,
  placeholder = "Select...",
  disabled = false,
  maxHeight = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef<View>(null);

  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const openDropdown = () => {
    if (disabled) return;

    buttonRef.current?.measure((fx, fy, width, height, px, py) => {
      setDropdownLayout({
        x: px,
        y: py + height + 4,
        width: width,
        height: Math.min(maxHeight, options.length * 45),
      });
      setIsVisible(true);
    });
  };

  const closeDropdown = () => {
    setIsVisible(false);
  };

  const handleSelect = (selectedValue: string | number) => {
    onSelect(selectedValue);
    closeDropdown();
  };

  const renderOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={[
        styles.option,
        item.value === value && styles.selectedOption
      ]}
      onPress={() => handleSelect(item.value)}
    >
      <Text style={[
        styles.optionText,
        item.value === value && styles.selectedOptionText
      ]}>
        {item.label}
      </Text>
      {item.value === value && (
        <Ionicons name="checkmark" size={16} color="#E91E63" />
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        style={[
          styles.dropdown,
          disabled && styles.disabled,
        ]}
        onPress={openDropdown}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dropdownText,
          !selectedOption && styles.placeholderText,
          disabled && styles.disabledText,
        ]}>
          {displayText}
        </Text>
        <Ionicons
          name={isVisible ? "chevron-up" : "chevron-down"}
          size={16}
          color={disabled ? "#71717a" : "#a1a1aa"}
        />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <Pressable style={styles.overlay} onPress={closeDropdown}>
          <View
            style={[
              styles.dropdownList,
              {
                position: 'absolute',
                top: dropdownLayout.y,
                left: dropdownLayout.x,
                width: dropdownLayout.width,
                maxHeight: dropdownLayout.height,
              }
            ]}
          >
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value.toString()}
              showsVerticalScrollIndicator={false}
              style={styles.flatList}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    // Shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#18181b',
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    color: '#f4f4f5',
  },
  placeholderText: {
    color: '#71717a',
  },
  disabledText: {
    color: '#71717a',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdownList: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 8,
    // Enhanced shadow for dropdown
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  flatList: {
    borderRadius: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#18181b',
  },
  selectedOption: {
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
  },
  optionText: {
    fontSize: 14,
    color: '#f4f4f5',
    flex: 1,
  },
  selectedOptionText: {
    color: '#E91E63',
    fontWeight: '500',
  },
});

export default Dropdown;