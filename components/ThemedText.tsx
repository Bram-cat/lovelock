import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";
import { useTheme } from '../contexts/ThemeContext';

interface ThemedTextProps extends TextProps {
  type?: "title" | "link" | "default" | "secondary" | "muted" | "inverse" | "onPrimary" | "onSecondary";
  lightColor?: string;
  darkColor?: string;
}

const ThemedText = ({ 
  type = "default", 
  lightColor, 
  darkColor, 
  ...props 
}: ThemedTextProps) => {
  const { theme, isDarkMode } = useTheme();
  
  const getTextColor = () => {
    // Use custom colors if provided
    if (lightColor && darkColor) {
      return isDarkMode ? darkColor : lightColor;
    }
    
    // Use theme colors based on type
    switch (type) {
      case "title":
        return theme.text;
      case "link":
        return theme.primary;
      case "secondary":
        return theme.textSecondary;
      case "muted":
        return theme.textMuted;
      case "inverse":
        return theme.textInverse;
      case "onPrimary":
        return theme.textOnPrimary;
      case "onSecondary":
        return theme.textOnSecondary;
      default:
        return theme.text;
    }
  };

  const getTypeStyle = () => {
    const baseColor = getTextColor();
    
    switch (type) {
      case "title":
        return {
          ...styles.title,
          color: baseColor,
        };
      case "link":
        return {
          ...styles.link,
          color: baseColor,
        };
      case "secondary":
        return {
          ...styles.text,
          color: baseColor,
          opacity: 0.8,
        };
      case "muted":
        return {
          ...styles.text,
          color: baseColor,
          opacity: 0.6,
        };
      default:
        return {
          ...styles.text,
          color: baseColor,
        };
    }
  };

  return (
    <Text {...props} style={[getTypeStyle(), props.style]}>
      {props.children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: "ShortStack",
    fontWeight: "600",
    fontSize: 18,
  },
  title: {
    fontFamily: "ShortStack",
    fontWeight: "700",
    fontSize: 24,
    textAlign: "center",
  },
  link: {
    fontFamily: "ShortStack",
    fontWeight: "600",
    fontSize: 18,
    textDecorationLine: "underline",
  },
});

export default ThemedText;
