import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, ActionSheetIOS, Platform, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout, Button } from '@/components';
import { styles } from './style';
import { useUser } from '@/context/UserProvider';
import { useAuth } from '@/context/AuthProvider';
import { apiAccountUrlV1 } from '@/config/api';

export default function ProfileScreen({ navigation }: NavigationProps<'Profile'>) {
  const { userInfo, loading, refreshUserInfo } = useUser();
  const { tokens } = useAuth();
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);

  const profilePhoto = userInfo?.photos?.find(p => p.typePhoto === 'PROFILE');
  const currentPhotoUri = tempPhoto || profilePhoto?.path || null;

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissões necessárias',
        'Precisamos de permissão para acessar a câmera e galeria de fotos.'
      );
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setTempPhoto(asset.uri);
        
        if (asset.base64) {
          await ResetPhoto({
            base64: asset.base64,
            contentType: asset.mimeType || 'image/jpeg',
            typePhoto: 'PROFILE',
            name: 'profile-photo',
            path: `profile/${Date.now()}.jpg`,
            description: 'Foto de perfil do usuário',
          });
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setTempPhoto(asset.uri);
        
        if (asset.base64) {
          await ResetPhoto({
            base64: asset.base64,
            contentType: asset.mimeType || 'image/jpeg',
            typePhoto: 'PROFILE',
            name: 'profile-photo',
            path: `profile/${Date.now()}.jpg`,
            description: 'Foto de perfil do usuário',
          });
        }
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  const showImagePickerOptions = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tirar Foto', 'Escolher da Galeria', currentPhotoUri ? 'Remover Foto' : ''].filter(Boolean),
          cancelButtonIndex: 0,
          destructiveButtonIndex: currentPhotoUri ? 3 : undefined,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          } else if (buttonIndex === 3 && currentPhotoUri) {
            setTempPhoto(null);
            // Aqui você pode chamar uma função para remover a foto do servidor
          }
        }
      );
    } else {
      // Android: usar Alert com botões
      const buttons: any[] = [
        { text: 'Tirar Foto', onPress: takePhoto },
        { text: 'Escolher da Galeria', onPress: pickImageFromGallery },
      ];
      
      if (currentPhotoUri) {
        buttons.push({
          text: 'Remover Foto',
          onPress: () => setTempPhoto(null),
          style: 'destructive',
        });
      }
      
      buttons.push({ text: 'Cancelar', style: 'cancel' });
      
      Alert.alert('Foto de Perfil', 'Escolha uma opção', buttons);
    }
  };

  const ResetPhoto = async (body: any) => {
    try {
      setLoadingPhoto(true);

      if (!body || typeof body !== "object") {
        Alert.alert('Erro', "Dados inválidos para enviar a foto.");
        return;
      }

      const requiredFields = ["base64", "contentType", "typePhoto", "name", "path", "description"];
      const missingFields = requiredFields.filter(
        (field) => !body[field] || typeof body[field] !== "string"
      );
      if (missingFields.length > 0) {
        Alert.alert(
          'Erro',
          `Campos obrigatórios faltando: ${missingFields.join(", ")}`
        );
        return;
      }

      if (!tokens?.accessToken) {
        Alert.alert('Erro', 'Token de acesso não encontrado');
        return;
      }

      const url = `${apiAccountUrlV1}/accounts/me/change-photo`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify(body),
      });

      // Tentar ler o corpo da resposta mesmo se der erro
      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `Erro ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      
      if (data?.content) {
        Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
        await refreshUserInfo();
      } else {
        Alert.alert('Aviso', 'Foto enviada mas resposta inesperada do servidor');
      }
    } catch (err: any) {
      console.error("🚨 Erro completo no ResetPhoto:", err);
      const errorMessage =
        err.message ||
        "Erro ao atualizar a foto. Verifique os dados e tente novamente.";
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <MainLayout navigation={navigation}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#4F6AF5" />
          <Text style={{ marginTop: 16, color: '#666' }}>Carregando...</Text>
        </View>
      </MainLayout>
    );
  }
  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity 
              style={styles.avatar}
              onPress={showImagePickerOptions}
              disabled={loadingPhoto}
            >
              {loadingPhoto ? (
                <ActivityIndicator size="large" color="#4F6AF5" />
              ) : currentPhotoUri ? (
                <Image 
                  source={{ uri: currentPhotoUri }} 
                  style={styles.avatarImage}
                />
              ) : (
                <MaterialCommunityIcons name="account" size={48} color="#4F6AF5" />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={showImagePickerOptions}
              disabled={loadingPhoto}
            >
              <MaterialCommunityIcons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userInfo?.name}</Text>
          <Text style={styles.userEmail}>{userInfo?.contact}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="account" size={20} color="#4F6AF5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nome Completo</Text>
              <Text style={styles.infoValue}>{userInfo?.name}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="email" size={20} color="#4F6AF5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>E-mail</Text>
              <Text style={styles.infoValue}>{userInfo?.contact}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="bell" size={24} color="#666" />
            <Text style={styles.menuItemText}>Notificações</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="shield-check" size={24} color="#666" />
            <Text style={styles.menuItemText}>Privacidade e Segurança</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="translate" size={24} color="#666" />
            <Text style={styles.menuItemText}>Idioma</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Button
            title="Editar Perfil"
            onPress={() => navigation.navigate('EditProfile')}
            variant="primary"
          />
        </View>
      </ScrollView>
    </MainLayout>
  );
}
