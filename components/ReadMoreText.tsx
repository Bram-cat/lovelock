import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ReadMoreTextProps {
  text: string;
  maxLength?: number;
  style?: any;
  readMoreStyle?: any;
}

export default function ReadMoreText({ 
  text, 
  maxLength = 200, 
  style, 
  readMoreStyle 
}: ReadMoreTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text.length <= maxLength) {
    return <Text style={style}>{text}</Text>;
  }

  const displayText = isExpanded ? text : `${text.substring(0, maxLength)}...`;

  return (
    <View>
      <Text style={style}>{displayText}</Text>
      <TouchableOpacity 
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.readMoreButton}
      >
        <Text style={[styles.readMoreText, readMoreStyle]}>
          {isExpanded ? 'Read Less' : 'Read More'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  readMoreButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: '#E91E63',
    fontSize: 14,
    fontWeight: '600',
  },
});