# Lovelock Project Documentation

## Recent Fixes

### Android ProGuard/R8 Deobfuscation Configuration (2025-09-30)

Fixed the deobfuscation warning that appeared during EAS builds by:

1. **Enhanced ProGuard Rules** (`android/app/proguard-rules.pro`):
   - Added source file and line number preservation for better crash reports
   - Added rules to keep React Native classes and native methods
   - Added Hermes engine class preservation rules

2. **Build Configuration** (`android/app/build.gradle`):
   - Enabled debug symbol generation for release builds
   - Added NDK debug symbol level configuration
   - Ensures mapping.txt file is generated at: `android/app/build/outputs/mapping/release/mapping.txt`

3. **EAS Build Configuration** (`eas.json`):
   - Enabled ProGuard in production builds via `enableProguardInReleaseBuilds: true`
   - This ensures R8/ProGuard mapping files are automatically uploaded to EAS for crash analysis

4. **Updated .gitignore**:
   - Added Android build artifact paths to prevent committing build outputs

**Result**: ANRs and crashes will now be easier to analyze and debug with proper stack trace deobfuscation.

---

# Lovelock AI Service Rework

## Issue

AI requests were getting stuck with "AI is analyzing..." and "Crafting your unique love profile..." messages, indicating the complex queue/rate limiting system was causing failures.

## Solution

Completely replaced the complex AI system with a simple, direct approach:

### New SimpleAIService Features:

- **Direct API calls** - No queues, no complex rate limiting
- **Dual Gemini keys** - Automatically switches between 2 API keys when one hits limits
- **Immediate fallback** - Gemini Key 1 � Gemini Key 2 � OpenAI � Static content
- **Minimal logging** - Reduced terminal spam
- **Fast responses** - No artificial delays or queuing

### Updated Components:

-  `screens/NumerologyReadingScreen.tsx`
-  `app/(tabs)/index.tsx`
-  `app/(tabs)/love-match.tsx`
-  `app/(tabs)/trust-assessment.tsx`

### Files Cleaned:

- Removed 70+ unnecessary files (old Android/Firebase/Convex files)
- Removed temporary SQL migration files
- Project streamlined for better performance

## Test Commands:

```bash
# Run the app to test AI functionality
npm start
# or
npx expo start
```

The AI should now respond much faster without getting stuck on loading screens.
