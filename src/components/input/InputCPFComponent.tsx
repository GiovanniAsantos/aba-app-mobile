import React from 'react';
import Input from '../input/InputComponent';
import { TextInputProps } from 'react-native';

interface InputCPFProps extends Omit<TextInputProps, 'keyboardType' | 'value' | 'onChangeText' | 'maxLength'> {
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

export default function InputCPF({
  value,
  onChangeText,
  ...rest
}: InputCPFProps) {
  const formatCPF = (text: string): string => {
    // Remove tudo que não é número
    const cleaned = text.replace(/\D/g, '');
    
    // Aplica a máscara XXX.XXX.XXX-XX
    let formatted = cleaned;
    if (cleaned.length > 3) {
      formatted = cleaned.slice(0, 3) + '.' + cleaned.slice(3);
    }
    if (cleaned.length > 6) {
      formatted = formatted.slice(0, 7) + '.' + cleaned.slice(6);
    }
    if (cleaned.length > 9) {
      formatted = formatted.slice(0, 11) + '-' + cleaned.slice(9, 11);
    }
    
    return formatted;
  };

  const handleChange = (text: string) => {
    const formatted = formatCPF(text);
    onChangeText(formatted);
  };

  return (
    <Input
      {...rest}
      value={value}
      onChangeText={handleChange}
      keyboardType="number-pad"
      maxLength={14}
      placeholder="000.000.000-00"
    />
  );
}
