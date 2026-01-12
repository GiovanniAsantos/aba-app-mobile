import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { styles } from './style';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'flat' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export default function Card({
  variant = 'elevated',
  size = 'medium',
  children,
  style,
  ...rest
}: CardProps) {
  const getCardStyle = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [styles.card];

    // Variações de estilo
    if (variant === 'elevated') baseStyles.push(styles.cardElevated);
    if (variant === 'flat') baseStyles.push(styles.cardFlat);
    if (variant === 'outlined') baseStyles.push(styles.cardOutlined);

    // Tamanhos
    if (size === 'small') baseStyles.push(styles.cardSmall);
    if (size === 'large') baseStyles.push(styles.cardLarge);

    // Estilo customizado
    if (style) baseStyles.push(style as ViewStyle);

    return baseStyles;
  };

  return (
    <View style={getCardStyle()} {...rest}>
      {children}
    </View>
  );
}
