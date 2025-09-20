/**
 * Lovelock Design System
 * Modern Mobile Design System with Cosmic Theme Integration
 * Based on mobile-design-system.json with cosmic/numerology adaptations
 */

export const DesignSystem = {
  colors: {
    // Primary palette with cosmic adaptations
    primary: {
      gradient: ["#6366F1", "#8B5CF6", "#A855F6"], // Modern purple gradient
      solidPurple: "#7C3AED",
      lightPurple: "#EDE9FE",
      cosmic: "#E91E63", // Keep original cosmic pink for brand consistency
    },

    backgrounds: {
      dark: "#000000", // Pure black for cosmic theme
      darkGray: "#1F2937",
      cardDark: "rgba(255, 255, 255, 0.05)", // Glassmorphism
      cardGlass: "rgba(255, 255, 255, 0.1)", // Enhanced glassmorphism
      purpleGradient: "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
      cosmicGradient:
        "linear-gradient(135deg, #1a0033 0%, #000000 50%, #001a33 100%)",
      cardLight: "#F3E8FF",
    },

    text: {
      primary: "#FFFFFF",
      secondary: "#9CA3AF",
      dark: "#111827",
      muted: "#6B7280",
      cosmic: "#8E8E93", // Original cosmic gray
    },

    semantic: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
      trust: "#34C759", // For trust assessments
      love: "#EC4899", // For love features
    },

    accent: {
      mint: "#10F5CC",
      cyan: "#06B6D4",
      pink: "#EC4899",
      yellow: "#FCD34D",
      gold: "#FFD700", // For cosmic elements
    },

    // Cosmic-specific colors
    cosmic: {
      purple: "#6366F1",
      pink: "#E91E63",
      blue: "#00D4FF",
      green: "#34C759",
      gold: "#FFD700",
      starlight: "#F0F8FF",
    },
  },

  typography: {
    fontFamilies: {
      primary: "System", // React Native default
      secondary: "System",
      mono: "Courier New",
    },

    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36,
      "5xl": 48,
      display: 64,
    },

    weights: {
      light: "300" as const,
      regular: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
    },

    lineHeights: {
      tight: 1.1,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    unit: 4,
    scale: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      "2xl": 24,
      "3xl": 32,
      "4xl": 40,
      "5xl": 48,
      "6xl": 64,
    },
  },

  borderRadius: {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    full: 9999,
    card: 20,
    button: 28,
  },

  shadows: {
    sm: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 6,
    },
    lg: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 15,
    },
    xl: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.1,
      shadowRadius: 25,
      elevation: 25,
    },
    glow: {
      shadowColor: "#7C3AED",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 20,
    },
    cosmicGlow: {
      shadowColor: "#E91E63",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    card: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 40,
      elevation: 15,
    },
  },

  components: {
    card: {
      base: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
      },
      variants: {
        glassmorphism: {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
        gradient: {
          // Will be handled by LinearGradient component
          colors: ["#667EEA", "#764BA2"],
        },
        cosmic: {
          backgroundColor: "#1C1C1E",
          borderWidth: 1,
          borderColor: "#2C2C2E",
        },
        elevated: {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        },
      },
    },

    button: {
      base: {
        borderRadius: 28,
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: "center" as const,
        justifyContent: "center" as const,
      },
      variants: {
        primary: {
          // Gradient handled by LinearGradient
          colors: ["#667EEA", "#764BA2"],
        },
        secondary: {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
        ghost: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: "#7C3AED",
        },
        cosmic: {
          colors: ["#E91E63", "#C2185B"],
        },
        cta: {
          colors: ["#10F5CC", "#06B6D4"],
          paddingVertical: 20,
          paddingHorizontal: 40,
        },
      },
      sizes: {
        sm: {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: 14,
        },
        md: {
          paddingVertical: 16,
          paddingHorizontal: 32,
          fontSize: 16,
        },
        lg: {
          paddingVertical: 20,
          paddingHorizontal: 40,
          fontSize: 18,
        },
      },
    },

    input: {
      base: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        color: "#FFFFFF",
      },
      focus: {
        borderColor: "#7C3AED",
        backgroundColor: "rgba(124, 58, 237, 0.05)",
      },
      placeholder: {
        color: "rgba(255, 255, 255, 0.4)",
      },
    },

    tabBar: {
      height: 83,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      borderTopWidth: 1,
      borderTopColor: "rgba(255, 255, 255, 0.1)",
      item: {
        minWidth: 80,
        iconSize: 24,
        labelSize: 10,
        activeColor: "#7C3AED",
        inactiveColor: "#6B7280",
      },
    },

    badge: {
      base: {
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 12,
        fontSize: 12,
        fontWeight: "600" as const,
      },
      variants: {
        default: {
          backgroundColor: "rgba(124, 58, 237, 0.1)",
          color: "#7C3AED",
        },
        success: {
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          color: "#10B981",
        },
        warning: {
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          color: "#F59E0B",
        },
        error: {
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          color: "#EF4444",
        },
        cosmic: {
          backgroundColor: "rgba(233, 30, 99, 0.1)",
          color: "#E91E63",
        },
      },
    },
  },

  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },

    easing: {
      ease: "ease",
      easeIn: "ease-in",
      easeOut: "ease-out",
      easeInOut: "ease-in-out",
    },
  },

  effects: {
    blur: {
      sm: 4,
      md: 10,
      lg: 20,
      xl: 40,
    },

    opacity: {
      0: 0,
      25: 0.25,
      50: 0.5,
      75: 0.75,
      100: 1,
    },
  },

  layout: {
    maxWidth: 414,
    padding: {
      screen: 16,
      section: 24,
    },
    safeArea: {
      top: 44,
      bottom: 34,
    },
  },
};

// Utility functions for easier usage
export const createCardStyle = (
  variant: keyof typeof DesignSystem.components.card.variants = "cosmic"
) => ({
  ...DesignSystem.components.card.base,
  ...DesignSystem.components.card.variants[variant],
  ...DesignSystem.shadows.md,
});

export const createButtonStyle = (
  variant: keyof typeof DesignSystem.components.button.variants = "primary",
  size: keyof typeof DesignSystem.components.button.sizes = "md"
) => ({
  ...DesignSystem.components.button.base,
  ...DesignSystem.components.button.sizes[size],
  ...DesignSystem.components.button.variants[variant],
});

export const createInputStyle = (focused: boolean = false) => ({
  ...DesignSystem.components.input.base,
  ...(focused ? DesignSystem.components.input.focus : {}),
});

// Gradient configurations for LinearGradient components
export const gradients = {
  primary: {
    colors: ["#667EEA", "#764BA2"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  cosmic: {
    colors: ["#1a0033", "#000000", "#001a33"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  cosmicHeart: {
    colors: ["#FF6B9D", "#E91E63", "#C2185B"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  success: {
    colors: ["#10B981", "#06B6D4"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  cta: {
    colors: ["#10F5CC", "#06B6D4"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  glass: {
    colors: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};

export default DesignSystem;
