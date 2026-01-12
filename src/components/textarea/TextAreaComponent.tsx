import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { styles } from './style';

interface TextAreaProps extends TextInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  showCharCount?: boolean;
  minHeight?: number;
}

export default function TextArea({
  label,
  required = false,
  error,
  helperText,
  disabled = false,
  showCharCount = false,
  maxLength,
  minHeight = 100,
  style,
  value,
  onFocus,
  onBlur,
  ...rest
}: TextAreaProps) {
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
    const containerStyles: any[] = [styles.textareaContainer];
    if (isFocused) containerStyles.push(styles.textareaFocused);
    if (error) containerStyles.push(styles.textareaError);
    if (disabled) containerStyles.push(styles.textareaDisabled);
    return containerStyles;
  };

  const charCount = value?.toString().length || 0;
  const isNearLimit = maxLength && charCount > maxLength * 0.9;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.labelRequired}> *</Text>}
        </Text>
      )}

      <View style={getContainerStyle()}>
        <TextInput
          style={[
            styles.textarea,
            { minHeight },
            disabled && styles.textareaDisabledText,
            style,
          ]}
          multiline
          numberOfLines={4}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          placeholderTextColor="#9ca3af"
          value={value}
          maxLength={maxLength}
          {...rest}
        />
      </View>

      <View style={styles.footer}>
        <View>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}
        </View>
        
        {showCharCount && maxLength && (
          <Text style={[styles.charCount, isNearLimit ? styles.charCountLimit : null]}>
            {charCount}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}
