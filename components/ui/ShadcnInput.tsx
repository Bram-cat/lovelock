import React, { useState, forwardRef } from 'react';
import { 
  TextInput, 
  View, 
  Text, 
  TextInputProps,
  ViewStyle,
  StyleSheet,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShadcnInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  variant?: 'default' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  required?: boolean;
}

const ShadcnInput = forwardRef<TextInput, ShadcnInputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  variant = 'default',
  size = 'default',
  disabled = false,
  required = false,
  style,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = (e: any) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    onBlur?.(e);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {
          backgroundColor: 'transparent',
          borderColor: focused ? '#f4f4f5' : (error ? '#ef4444' : '#27272a'),
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 36,
          paddingHorizontal: 12,
          fontSize: 14,
        };
      case 'lg':
        return {
          height: 44,
          paddingHorizontal: 16,
          fontSize: 16,
        };
      default:
        return {
          height: 40,
          paddingHorizontal: 12,
          fontSize: 14,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View style={[containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      
      <View 
        style={[
          styles.inputContainer,
          variantStyles,
          sizeStyles,
          focused && styles.focused,
          error && styles.error,
          disabled && styles.disabled,
        ]}
      >
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={16}
            color={focused ? '#f4f4f5' : (error ? '#ef4444' : '#a1a1aa')}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          ref={ref}
          {...props}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            disabled && styles.disabledInput,
            style,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#71717a"
          editable={!disabled}
          selectTextOnFocus={!disabled}
        />
        
        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress || disabled}
            style={styles.rightIconContainer}
          >
            <Ionicons 
              name={rightIcon} 
              size={16}
              color={focused ? '#f4f4f5' : (error ? '#ef4444' : '#a1a1aa')}
            />
          </Pressable>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
});

ShadcnInput.displayName = 'ShadcnInput';

const styles = StyleSheet.create({
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f4f4f5', // foreground
    lineHeight: 16,
  },
  required: {
    color: '#ef4444', // destructive
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
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
  focused: {
    borderColor: '#f4f4f5',
    // Focus ring effect
    shadowColor: '#f4f4f5',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
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
  disabled: {
    opacity: 0.5,
    backgroundColor: '#09090b', // muted
  },
  leftIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  rightIconContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#f4f4f5', // foreground
    paddingVertical: 0, // Remove default padding
  },
  inputWithLeftIcon: {
    marginLeft: 0,
  },
  inputWithRightIcon: {
    marginRight: 0,
  },
  disabledInput: {
    color: '#71717a', // muted-foreground
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444', // destructive
    marginTop: 4,
    lineHeight: 16,
  },
});

export default ShadcnInput;