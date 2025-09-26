import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { NativePricingComponent } from "../components/NativePricingComponent";

// Import Clerk's PricingTable only for web
let PricingTable: any = null;
if (Platform.OS === "web") {
  try {
    // Dynamic import for web only
    const ClerkWeb = require("@clerk/clerk-expo/web");
    PricingTable = ClerkWeb.PricingTable;
  } catch (error) {
    console.log("Clerk web components not available:", error);
  }
}

export default function PricingPage() {
  if (Platform.OS !== "web" || !PricingTable) {
    // Fall back to native pricing component
    return <NativePricingComponent />;
  }

  // Web-only Clerk PricingTable
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Unlock the full power of Lovelock with premium features
        </Text>
      </View>

      {/* Clerk's official PricingTable component */}
      <PricingTable
        appearance={{
          baseTheme: "light",
          variables: {
            colorPrimary: "#667eea",
            colorBackground: "#ffffff",
            borderRadius: "12px",
          },
        }}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🔒 Secure billing powered by Clerk + Stripe
        </Text>
        <Text style={styles.disclaimerText}>
          Cancel anytime • 30-day money-back guarantee
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D1B69",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    maxWidth: 500,
    lineHeight: 26,
  },
  footer: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  footerText: {
    fontSize: 16,
    color: "#34C759",
    fontWeight: "600",
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
