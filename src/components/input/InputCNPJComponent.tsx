import React from 'react';
import Input from '../input/InputComponent';
import { TextInputProps } from 'react-native';

interface InputCNPJProps extends Omit<TextInputProps, 'keyboardType' | 'value' | 'onChangeText' | 'maxLength'> {
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

export default function InputCNPJ({
  value,
  onChangeText,
  ...rest
}: InputCNPJProps) {
  const formatCNPJ = (text: string): string => {
    // Remove tudo que não é número
    const cleaned = text.replace(/\D/g, '');
    
    // Aplica a máscara XX.XXX.XXX/XXXX-XX
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + '.' + cleaned.slice(2);
    }
    if (cleaned.length > 5) {
      formatted = formatted.slice(0, 6) + '.' + cleaned.slice(5);
    }
    if (cleaned.length > 8) {
      formatted = formatted.slice(0, 10) + '/' + cleaned.slice(8);
    }
    if (cleaned.length > 12) {
      formatted = formatted.slice(0, 15) + '-' + cleaned.slice(12, 14);
    }
    
    return formatted;
  };

  const handleChange = (text: string) => {
    const formatted = formatCNPJ(text);
    onChangeText(formatted);
  };

  return (
    <Input
      {...rest}
      value={value}
      onChangeText={handleChange}
      keyboardType="number-pad"
      maxLength={18}
      placeholder="00.000.000/0000-00"
    />
  );
}
