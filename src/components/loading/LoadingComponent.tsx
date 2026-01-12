import React from 'react';
import { View, Text, ActivityIndicator, Modal } from 'react-native';
import { styles } from './style';

interface LoadingProps {
  visible?: boolean;
  text?: string;
  subtext?: string;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
  inline?: boolean;
}

export default function Loading({
  visible = true,
  text,
  subtext,
  size = 'large',
  color = '#4F6AF5',
  overlay = true,
  inline = false,
}: LoadingProps) {
  if (!visible) return null;

  // Modo inline (sem overlay, para usar dentro de componentes)
  if (inline) {
    return (
      <View style={styles.inlineContainer}>
        <ActivityIndicator
          size={size}
          color={color}
          style={size === 'small' ? styles.spinnerSmall : size === 'large' ? styles.spinnerLarge : undefined}
        />
        {text && <Text style={styles.inlineText}>{text}</Text>}
      </View>
    );
  }

  // Modo com overlay
  const content = (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator
          size={size}
          color={color}
          style={[
            styles.spinner,
            size === 'small' ? styles.spinnerSmall : size === 'large' ? styles.spinnerLarge : undefined,
          ]}
        />
        {text && <Text style={styles.text}>{text}</Text>}
        {subtext && <Text style={styles.subtext}>{subtext}</Text>}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        {content}
      </Modal>
    );
  }

  return content;
}
