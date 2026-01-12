import React from 'react';
import Input from '../input/InputComponent';
import { TextInputProps } from 'react-native';

interface InputNumberProps extends Omit<TextInputProps, 'keyboardType' | 'value' | 'onChangeText'> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: any;
  rightIcon?: any;
  disabled?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  maxValue?: number;
  minValue?: number;
  decimalPlaces?: number;
}

export default function InputNumber({
  value,
  onChangeText,
  maxValue,
  minValue,
  decimalPlaces = 0,
  ...rest
}: InputNumberProps) {
  const handleChange = (text: string) => {
    // Remove caracteres não numéricos (mantém apenas números e ponto/vírgula)
    let cleaned = text.replace(/[^0-9.,]/g, '');
    
    // Substitui vírgula por ponto
    cleaned = cleaned.replace(',', '.');
    
    // Garante apenas um ponto decimal
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limita casas decimais
    if (decimalPlaces > 0 && parts.length === 2) {
      cleaned = parts[0] + '.' + parts[1].substring(0, decimalPlaces);
    }
    
    // Valida min/max
    const numValue = parseFloat(cleaned);
    if (!isNaN(numValue)) {
      if (maxValue !== undefined && numValue > maxValue) {
        cleaned = maxValue.toString();
      }
      if (minValue !== undefined && numValue < minValue) {
        cleaned = minValue.toString();
      }
    }
    
    onChangeText(cleaned);
  };

  return (
    <Input
      {...rest}
      value={value}
      onChangeText={handleChange}
      keyboardType="decimal-pad"
    />
  );
}
