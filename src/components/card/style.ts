import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardElevated: {
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardFlat: {
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardOutlined: {
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 2,
    borderColor: '#4F6AF5',
  },
  cardSmall: {
    padding: 12,
  },
  cardLarge: {
    padding: 20,
  },
});
