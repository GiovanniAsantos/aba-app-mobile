import React from 'react';
import Input from '../input/InputComponent';
import { TextInputProps } from 'react-native';

interface InputLinkProps extends Omit<TextInputProps, 'keyboardType' | 'autoCapitalize' | 'autoCorrect'> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: any;
  rightIcon?: any;
  disabled?: boolean;
  value: string;
  onChangeText: (text: string) => void;
}

export default function InputLink({
  value,
  onChangeText,
  ...rest
}: InputLinkProps) {
  return (
    <Input
      {...rest}
      value={value}
      onChangeText={onChangeText}
      keyboardType="url"
      autoCapitalize="none"
      autoCorrect={false}
      placeholder="https://exemplo.com"
      leftIcon="link-variant"
    />
  );
}
