export const Colors = {
  primary: "#d14fa7",
  secondary: "#a259d9",
  tertiary: "#7b2ff2",
  background: "#f5c6ec",
  
  // Tab-specific themes
  home: {
    primary: ["#667eea", "#764ba2"],
    secondary: ["#f093fb", "#f5576c"],
    accent: "#ffffff",
    text: "#2d1b69",
    cardBg: "rgba(255, 255, 255, 0.95)",
  },
  
  numerology: {
    primary: ["#667eea", "#764ba2"],
    secondary: ["#f093fb", "#f5576c"],
    accent: "#ffffff",
    text: "#2d1b69",
    cardBg: "rgba(255, 255, 255, 0.95)",
    numbers: {
      destiny: ["#667eea", "#764ba2"],
      soul: ["#ff6b9d", "#e85a8a"],
      personality: ["#4ecdc4", "#44a08d"],
      expression: ["#96e6a1", "#7dd87f"],
    }
  },
  
  chat: {
    primary: ["#ff6b9d", "#e85a8a"],
    secondary: ["#f093fb", "#f5576c"],
    accent: "#ffffff",
    text: "#2d1b69",
    cardBg: "rgba(255, 255, 255, 0.95)",
    userBubble: ["#667eea", "#764ba2"],
    aiBubble: ["#f8f9ff", "#ffffff"],
  },
  
  fun: {
    primary: ["#f093fb", "#f5576c"],
    secondary: ["#ff6b9d", "#e85a8a"],
    accent: "#ffffff",
    text: "#2d1b69",
    cardBg: "rgba(255, 255, 255, 0.95)",
    games: {
      truth: ["#ff6b9d", "#e85a8a"],
      dare: ["#f093fb", "#f5576c"],
      love: ["#667eea", "#764ba2"],
      compatibility: ["#4ecdc4", "#44a08d"],
    }
  },
  
  about: {
    primary: ["#4ecdc4", "#44a08d"],
    secondary: ["#96e6a1", "#7dd87f"],
    accent: "#ffffff",
    text: "#2d1b69",
    cardBg: "rgba(255, 255, 255, 0.95)",
  },
  
  profile: {
    primary: ["#96e6a1", "#7dd87f"],
    secondary: ["#4ecdc4", "#44a08d"],
    accent: "#ffffff",
    text: "#2d1b69",
    cardBg: "rgba(255, 255, 255, 0.95)",
  },
  
  // Common elements
  card: {
    purple: "#a259d9",
    red: "#f47ca3",
    shadow: "rgba(0, 0, 0, 0.1)",
    border: "rgba(102, 126, 234, 0.2)",
  },
  
  text: {
    primary: "#2d1b69",
    secondary: "#666",
    white: "#fff",
    light: "rgba(255, 255, 255, 0.9)",
    placeholder: "rgba(102, 126, 234, 0.5)",
  },
  
  button: {
    dark: "#333",
    light: "#fff",
    disabled: ["#ccc", "#999"],
  },
  
  // Status colors
  success: ["#96e6a1", "#7dd87f"],
  warning: ["#ffd93d", "#ffcd3c"],
  error: ["#ff6b6b", "#ee5a52"],
  info: ["#667eea", "#764ba2"],
} as const;

export default Colors;
