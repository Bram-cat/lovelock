import React, { useState } from 'react';
import { Image, Text } from 'react-native';

interface WebStickerProps {
  category: 'mystical' | 'cosmic' | 'love' | 'energy' | 'money' | 'success';
  size?: number;
  style?: any;
  fallbackTextStyle?: any;
}

const WebSticker: React.FC<WebStickerProps> = ({ 
  category = 'mystical', 
  size = 32, 
  style,
  fallbackTextStyle 
}) => {
  const [imageError, setImageError] = useState(false);
  
  // High-quality web stickers with emoji fallbacks
  const stickers = {
    mystical: {
      url: 'https://cdn.pixabay.com/photo/2021/02/03/13/37/crystal-ball-5979152_960_720.png',
      emoji: '🔮'
    },
    cosmic: {
      url: 'https://cdn.pixabay.com/photo/2016/03/31/19/25/star-1295836_960_720.png',
      emoji: '⭐'
    },
    love: {
      url: 'https://cdn.pixabay.com/photo/2016/03/31/19/25/heart-1295821_960_720.png',
      emoji: '💕'
    },
    energy: {
      url: 'https://cdn.pixabay.com/photo/2016/03/31/19/25/lightning-1295833_960_720.png',
      emoji: '⚡'
    },
    money: {
      url: 'https://cdn.pixabay.com/photo/2017/02/12/21/29/false-2061132_960_720.png',
      emoji: '💰'
    },
    success: {
      url: 'https://cdn.pixabay.com/photo/2016/03/31/19/50/crown-1295689_960_720.png',
      emoji: '👑'
    }
  };

  const stickerInfo = stickers[category] || stickers.mystical;

  // Handle image load error - fallback to emoji
  const handleImageError = () => {
    setImageError(true);
  };

  // If image failed to load, show emoji fallback
  if (imageError) {
    return (
      <Text style={[{ fontSize: size }, fallbackTextStyle]}>
        {stickerInfo.emoji}
      </Text>
    );
  }

  // Try to render web-based sticker
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
};

export default WebSticker;
