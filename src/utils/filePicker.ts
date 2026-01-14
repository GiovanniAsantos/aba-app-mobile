import * as DocumentPicker from 'expo-document-picker';

export type PickedDocument = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
};

export async function pickDocument(
  options?: DocumentPicker.DocumentPickerOptions
): Promise<PickedDocument | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: false,
    ...options,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name ?? 'file',
    mimeType: asset.mimeType,
    size: asset.size,
  };
}
