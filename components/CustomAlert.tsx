import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive" | "primary" | "upgrade";
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  buttons?: CustomAlertButton[];
  onDismiss?: () => void;
  type?: "success" | "error" | "warning" | "info" | "limit" | "premium";
}

export default function CustomAlert({
  visible,
  title,
  message,
  icon,
  iconColor,
  buttons = [{ text: "OK", style: "primary" }],
  onDismiss,
  type = "info",
}: CustomAlertProps) {
  // Enhanced theme colors for consistency with app
  const theme = {
    surface: "#1C1C1E",
    surfaceElevated: "#2C2C2E",
    text: "#FFFFFF",
    textSecondary: "rgba(255, 255, 255, 0.8)",
    textTertiary: "rgba(255, 255, 255, 0.6)",
    primary: "#9333EA",
    secondary: "#FF6B9D",
    accent: "#667eea",
    border: "rgba(147, 51, 234, 0.2)",
  };

  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: icon || "checkmark-circle",
          iconColor: iconColor || "#4CAF50",
        };
      case "error":
        return {
          icon: icon || "close-circle",
          iconColor: iconColor || "#F44336",
        };
      case "warning":
        return {
          icon: icon || "warning",
          iconColor: iconColor || "#FF9800",
        };
      case "limit":
        return {
          icon: icon || "lock-closed",
          iconColor: iconColor || "#FF6B9D",
        };
      case "premium":
        return {
          icon: icon || "diamond",
          iconColor: iconColor || "#FFD700",
        };
      default:
        return {
          icon: icon || "information-circle",
          iconColor: iconColor || "#2196F3",
        };
    }
  };

  const getButtonStyle = (style?: string): { 
    backgroundColor: string; 
    colors: readonly [string, string, ...string[]] 
  } => {
    switch (style) {
      case "destructive":
        return {
          backgroundColor: "#FF4444",
          colors: ["#FF4444", "#CC3333"] as const,
        };
      case "cancel":
        return {
          backgroundColor: "rgba(0,0,0,0.1)",
          colors: ["rgba(0,0,0,0.1)", "rgba(0,0,0,0.2)"] as const,
        };
      case "primary":
        return {
          backgroundColor: "#FF6B9D",
          colors: ["#FF6B9D", "#C44569"] as const,
        };
      case "upgrade":
        return {
          backgroundColor: "#FFD700",
          colors: ["#FFD700", "#FFA500"] as const,
        };
      default:
        return {
          backgroundColor: theme.primary,
          colors: [theme.primary, theme.accent] as const,
        };
    }
  };

  const getButtonTextColor = (style?: string) => {
    switch (style) {
      case "cancel":
        return theme.text;
      case "primary":
        return "white";
      case "upgrade":
        return "#000000";
      default:
        return "white";
    }
  };

  const config = getTypeConfig();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.alertContainer,
            {
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name={config.icon} size={32} color={config.iconColor} />
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          </View>

          {/* Message */}
          {message && (
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              {message}
            </Text>
          )}

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => {
              const buttonStyle = getButtonStyle(button.style);
              const textColor = getButtonTextColor(button.style);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    buttons.length === 1 && styles.singleButton,
                  ]}
                  onPress={() => {
                    button.onPress?.();
                    onDismiss?.();
                  }}
                >
                  <LinearGradient
                    colors={buttonStyle.colors}
                    style={styles.buttonGradient}
                  >
                    <Text style={[styles.buttonText, { color: textColor }]}>
                      {button.text}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 9999,
    elevation: 9999,
  },
  alertContainer: {
    width: width - 40,
    maxWidth: 400,
    borderRadius: 24,
    padding: 28,
    shadowColor: "#9333EA",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 30,
    zIndex: 10000,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 12,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 28,
    opacity: 0.9,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  singleButton: {
    flex: 1,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.3,
  },
});

CustomAlert.displayName = "CustomAlert";

// Utility hook for easy usage
export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<CustomAlertProps | null>(
    null
  );

  const showAlert = (
    config: Omit<CustomAlertProps, "visible" | "onDismiss">
  ) => {
    setAlertConfig({
      ...config,
      visible: true,
      onDismiss: () => setAlertConfig(null),
    });
  };

  const hideAlert = () => {
    setAlertConfig(null);
  };

  const AlertComponent = alertConfig ? (
    <CustomAlert
      {...alertConfig}
      visible={!!alertConfig}
      onDismiss={hideAlert}
    />
  ) : null;

  return {
    showAlert,
    hideAlert,
    AlertComponent,
  };
};

// Helper function for usage limit alerts
export const showUsageLimitAlert = (
  showAlert: (config: any) => void,
  featureName: string,
  usedCount: number,
  limitCount: number,
  onUpgrade?: () => void
) => {
  const featureConfig: { [key: string]: { emoji: string, name: string, description: string } } = {
    numerology: {
      emoji: "🔮",
      name: "Numerology Reading",
      description: "Discover your life path, destiny, and soul purpose through numbers"
    },
    love_match: {
      emoji: "💕",
      name: "Love Match Analysis",
      description: "Find your perfect romantic compatibility and soulmate connections"
    },
    trust_assessment: {
      emoji: "🛡️",
      name: "Trust Assessment",
      description: "Analyze relationship trust and compatibility through numerology"
    },
  };

  const config = featureConfig[featureName] || {
    emoji: "✨",
    name: featureName.replace('_', ' '),
    description: "Unlock more insights"
  };

  showAlert({
    type: "limit",
    title: `${config.emoji} ${config.name} Limit Reached`,
    message: `You've used ${usedCount}/${limitCount} ${config.name.toLowerCase()} readings this month.\n\n${config.description}\n\nUpgrade to Premium for 25 numerology, 15 love match, and 10 trust assessments per month, or upgrade to Unlimited for unlimited access!`,
    buttons: [
      {
        text: "Maybe Later",
        style: "cancel",
      },
      ...(onUpgrade
        ? [
            {
              text: "Upgrade Now",
              style: "upgrade" as const,
              onPress: onUpgrade,
            },
          ]
        : []),
    ],
  });
};
