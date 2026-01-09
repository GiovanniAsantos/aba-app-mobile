import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { styles } from './style';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  ...rest
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [styles.button];

    // Variações de cor
    if (variant === 'secondary') baseStyles.push(styles.buttonSecondary);
    if (variant === 'danger') baseStyles.push(styles.buttonDanger);
    if (variant === 'success') baseStyles.push(styles.buttonSuccess);

    // Tamanhos
    if (size === 'small') baseStyles.push(styles.buttonSmall);
    if (size === 'large') baseStyles.push(styles.buttonLarge);

    // Estados
    if (disabled) baseStyles.push(styles.buttonDisabled);

    // Estilo customizado
    if (style) baseStyles.push(style as ViewStyle);

    return baseStyles;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyles: TextStyle[] = [styles.buttonText];

    if (variant === 'secondary') baseStyles.push(styles.buttonSecondaryText);
    if (disabled) baseStyles.push(styles.buttonTextDisabled);

    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#007AFF' : '#fff'} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
