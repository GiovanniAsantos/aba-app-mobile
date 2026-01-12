import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MainLayout, Button, Input } from '@/components';
import { styles } from './style';
import { useUser } from '@/context/UserProvider';
import { useAuth } from '@/context/AuthProvider';
import { apiAccountUrlV1 } from '@/config/api';
import type { NavigationProps } from '../../types/navigation';

export default function EditProfileScreen({ navigation }: NavigationProps<'EditProfile'>) {
  const { userInfo, refreshUserInfo } = useUser();
  const { tokens, logout } = useAuth();

  // Estados para mudança de email
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);

  // Estados para mudança de senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleChangeEmail = async () => {
    if (!newEmail || !confirmNewEmail) {
      Alert.alert('Erro', 'Preencha todos os campos de e-mail');
      return;
    }

    if (newEmail !== confirmNewEmail) {
      Alert.alert('Erro', 'Os e-mails não coincidem');
      return;
    }

    if (userInfo?.contact === newEmail) {
      Alert.alert('Erro', 'O novo e-mail é igual ao e-mail atual');
      return;
    }

    setLoadingEmail(true);

    try {
      const response = await fetch(`${apiAccountUrlV1}/accounts/me/change-my-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify({
          contact: confirmNewEmail,
          currentContact: userInfo?.contact,
        }),
      });

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
      
      // Limpar campos
      setNewEmail('');
      setConfirmNewEmail('');
      
      // Fazer logout e exigir novo login com o novo email
      Alert.alert(
        'Sucesso', 
        data.message || 'E-mail atualizado com sucesso! Você será redirecionado para fazer login novamente com o novo e-mail.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await logout();
              navigation.navigate('Login');
            }
          }
        ]
      );
    } catch (err: any) {
      console.error('Erro ao alterar e-mail:', err);
      Alert.alert('Erro', err.message || 'Não foi possível alterar o e-mail');
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Erro', 'Preencha todos os campos de senha');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoadingPassword(true);

    try {
      const response = await fetch(`${apiAccountUrlV1}/accounts/me/change-my-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.accessToken}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

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
      Alert.alert('Sucesso', data.message || 'Senha atualizada com sucesso!');
      
      // Limpar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      console.error('Erro ao alterar senha:', err);
      Alert.alert('Erro', err.message || 'Não foi possível alterar a senha');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        {/* Seção de Alteração de E-mail */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alterar E-mail</Text>
          <Text style={styles.sectionSubtitle}>E-mail atual: {userInfo?.contact}</Text>

          <Input
            label="Novo E-mail"
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="Digite o novo e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Confirmar Novo E-mail"
            value={confirmNewEmail}
            onChangeText={setConfirmNewEmail}
            placeholder="Digite novamente o novo e-mail"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button
            title="Alterar E-mail"
            onPress={handleChangeEmail}
            variant="primary"
            loading={loadingEmail}
            disabled={loadingEmail}
          />
        </View>

        {/* Seção de Alteração de Senha */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alterar Senha</Text>

          <Input
            label="Senha Atual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Digite a senha atual"
            secureTextEntry
          />

          <Input
            label="Nova Senha"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Digite a nova senha"
            secureTextEntry
          />

          <Input
            label="Confirmar Nova Senha"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            placeholder="Digite novamente a nova senha"
            secureTextEntry
          />

          <Button
            title="Alterar Senha"
            onPress={handleChangePassword}
            variant="primary"
            loading={loadingPassword}
            disabled={loadingPassword}
          />
        </View>
      </ScrollView>
    </MainLayout>
  );
}
