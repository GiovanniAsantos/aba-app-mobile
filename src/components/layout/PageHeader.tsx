import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type PageHeaderProps = {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
};

export default function PageHeader({ iconName, title, subtitle, containerStyle, titleStyle, subtitleStyle }: PageHeaderProps) {
  return (
    <View style={[styles.header, containerStyle]}> 
      <MaterialCommunityIcons name={iconName} size={32} color="#4F6AF5" />
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
    paddingVertical: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});
