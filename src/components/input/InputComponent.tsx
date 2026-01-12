import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './style';

interface InputProps extends TextInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  disabled?: boolean;
}

export default function Input({
  label,
  required = false,
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled = false,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getContainerStyle = () => {
    const containerStyles: any[] = [styles.inputContainer];
    if (isFocused) containerStyles.push(styles.inputFocused);
    if (error) containerStyles.push(styles.inputError);
    if (disabled) containerStyles.push(styles.inputDisabled);
    return containerStyles;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.labelRequired}> *</Text>}
        </Text>
      )}
      
      <View style={getContainerStyle()}>
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon}
            size={20}
            color={error ? '#ef4444' : isFocused ? '#4F6AF5' : '#9ca3af'}
            style={styles.icon}
          />
        )}
        
        <TextInput
          style={[styles.input, disabled && styles.inputDisabledText, style]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          placeholderTextColor="#9ca3af"
          {...rest}
        />
        
        {rightIcon && (
          <MaterialCommunityIcons
            name={rightIcon}
            size={20}
            color={error ? '#ef4444' : isFocused ? '#4F6AF5' : '#9ca3af'}
            style={styles.rightIcon}
          />
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}
