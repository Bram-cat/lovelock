import 'dotenv/config';

export default {
  "expo": {
    "name": "Lovelock",
    "slug": "lovelock",
    "description": "Unlock hidden secrets about yourself and others. Discover personality patterns, predict behavior, and master the art of reading people using ancient numerology and modern psychology.",
    "version": "1.0.0",
    "scheme": "lovelock",
    "platforms": ["ios", "android", "web"],
    "keywords": ["personality", "numerology", "astrology", "self-discovery", "character analysis", "psychology", "mind reading", "prediction", "life insights"],
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "assetBundlePatterns": [
      "**/*"
    ],
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "color": "#ec4899",
          "defaultChannel": "default"
        }
      ],
      "expo-secure-store",
      "expo-dev-client"
    ],
    "extra": {
      "eas": {
        "projectId": "980b5e8d-2119-4386-ae31-7e8b4d45ed3e"
      },
      "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY": process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      "EXPO_PUBLIC_CLERK_SECRET_KEY": process.env.EXPO_PUBLIC_CLERK_SECRET_KEY,
      "EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID": process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
      "EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_SECRET": process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_SECRET,
      "EXPO_PUBLIC_SUPABASE_URL": process.env.EXPO_PUBLIC_SUPABASE_URL,
      "EXPO_PUBLIC_SUPABASE_AUTH_URL": process.env.EXPO_PUBLIC_SUPABASE_AUTH_URL,
      "EXPO_PUBLIC_SUPABASE_KEY": process.env.EXPO_PUBLIC_SUPABASE_KEY,
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      "EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY": process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    },
    "android": {
      "package": "com.cowman.lovelock",
      "versionCode": 1,
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.NOTIFICATIONS"
      ],
      "intentFilters": [
        {
          "action": "VIEW",
          "category": ["BROWSABLE", "DEFAULT"],
          "data": {
            "scheme": "lovelock"
          }
        },
        {
          "action": "VIEW",
          "category": ["BROWSABLE", "DEFAULT"],
          "data": {
            "scheme": "lovelock",
            "host": "oauth-callback"
          }
        },
        {
          "action": "VIEW",
          "category": ["BROWSABLE", "DEFAULT"],
          "data": {
            "scheme": "https",
            "host": "lovelock.app",
            "pathPrefix": "/oauth-callback"
          }
        }
      ]
    },
    "ios": {
      "bundleIdentifier": "com.cowman.lovelock",
      "buildNumber": "1",
      "associatedDomains": [
        "applinks:lovelock.app",
        "applinks:auth.lovelock.app"
      ],
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLName": "lovelock",
            "CFBundleURLSchemes": ["lovelock"]
          },
          {
            "CFBundleURLName": "lovelock.oauth",
            "CFBundleURLSchemes": ["com.cowman.lovelock"]
          }
        ],
        "NSUserNotificationsUsageDescription": "This app uses notifications to keep you updated about your matches and insights."
      }
    },
    "web": {
      "bundler": "metro"
    }
  }
};