import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    // Document List Styles
    documentListContainer: {
        flex: 1,
    },
    documentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    documentHeaderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    documentScrollView: {
        flex: 1,
    },
    emptyDocumentState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    emptyDocumentText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        fontWeight: '500',
    },
    emptyDocumentSubtext: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    documentContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    documentName: {
        flex: 1,
        fontSize: 14,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    documentRemoveButton: {
        padding: 8,
    },
});