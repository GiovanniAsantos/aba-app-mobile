import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  groupContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4F6AF5',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  groupRuleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F6AF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  groupRuleText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyGroup: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  emptyGroupText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
});
