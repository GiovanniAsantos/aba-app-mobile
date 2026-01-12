import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from './style';

interface CalendarProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
}

export default function Calendar({
  label,
  required = false,
  placeholder = 'Selecione uma data',
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  mode = 'date',
  minimumDate,
  maximumDate,
}: CalendarProps) {
  const [show, setShow] = useState(false);

  const formatDate = (date: Date): string => {
    if (mode === 'time') {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (mode === 'datetime') {
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const getButtonStyle = () => {
    const buttonStyles: any[] = [styles.calendarButton];
    if (error) buttonStyles.push(styles.calendarButtonError);
    if (disabled) buttonStyles.push(styles.calendarButtonDisabled);
    return buttonStyles;
  };

  const getIcon = () => {
    if (mode === 'time') return 'clock-outline';
    if (mode === 'datetime') return 'calendar-clock';
    return 'calendar';
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.labelRequired}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={getButtonStyle()}
        onPress={() => !disabled && setShow(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.calendarText,
            !value && styles.calendarPlaceholder,
            disabled && styles.calendarDisabledText,
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        <MaterialCommunityIcons
          name={getIcon()}
          size={20}
          color={disabled ? '#9ca3af' : '#6b7280'}
        />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}
