import React, { useState } from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { StickerService, StickerInfo } from '../services/StickerService';

interface StickerProps {
  category?: string;
  context?: 'daily_insight' | 'level_up' | 'achievement' | 'love_match' | 'money_prediction';
  size?: number;
  style?: any;
  fallbackTextStyle?: any;
}

const Sticker: React.FC<StickerProps> = ({ 
  category = 'mystical', 
  context, 
  size = 32, 
  style,
  fallbackTextStyle 
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Get appropriate sticker
  const stickerInfo: StickerInfo = context 
    ? StickerService.getContextSticker(context)
    : StickerService.getSticker(category);

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // If web image failed or not available, show fallback emoji
  if (imageError || !stickerInfo.url) {
    return (
      <Text style={[{ fontSize: size }, fallbackTextStyle]}>
        {stickerInfo.fallbackEmoji}
      </Text>
    );
  }

  // Render web-based sticker
  if (stickerInfo.type === 'web') {
    return (
      <Image
        source={{ uri: stickerInfo.url }}
        style={[
          {
            width: size,
            height: size,
            resizeMode: 'contain',
          },
          style
        ]}
        onError={handleImageError}
      />
    );
  }

  // For Lottie animations (requires lottie-react-native)
  if (stickerInfo.type === 'lottie') {
    // Fallback to emoji if Lottie not implemented
    return (
      <Text style={[{ fontSize: size }, fallbackTextStyle]}>
        {stickerInfo.fallbackEmoji}
      </Text>
    );
  }

  // For local assets (when available)
  if (stickerInfo.type === 'local' && stickerInfo.localPath) {
    const localPath = StickerService.getLocalStickerPath(stickerInfo.id);
    if (localPath) {
      return (
        <Image
          source={localPath}
          style={[
            {
              width: size,
              height: size,
              resizeMode: 'contain',
            },
            style
          ]}
          onError={handleImageError}
        />
      );
    }
  }

  // Final fallback
  return (
    <Text style={[{ fontSize: size }, fallbackTextStyle]}>
      {stickerInfo.fallbackEmoji}
    </Text>
  );
};

export default Sticker;
