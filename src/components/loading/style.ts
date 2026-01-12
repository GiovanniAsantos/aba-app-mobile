import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
  },
  spinner: {
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
  },
  subtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  // Variações de tamanho
  spinnerSmall: {
    transform: [{ scale: 0.8 }],
  },
  spinnerLarge: {
    transform: [{ scale: 1.3 }],
  },
  // Variação inline (sem overlay)
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  inlineText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#6b7280',
  },
});
