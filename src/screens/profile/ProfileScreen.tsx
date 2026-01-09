import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NavigationProps } from '../../types/navigation';
import { MainLayout, Button } from '@/components';
import { styles } from './style';

export default function ProfileScreen({ navigation }: NavigationProps<'Profile'>) {
  return (
    <MainLayout navigation={navigation}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={48} color="#4F6AF5" />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <MaterialCommunityIcons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>Fulano da Silva</Text>
          <Text style={styles.userEmail}>fulano@exemplo.com</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="account" size={20} color="#4F6AF5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nome Completo</Text>
              <Text style={styles.infoValue}>Fulano da Silva Santos</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="email" size={20} color="#4F6AF5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>E-mail</Text>
              <Text style={styles.infoValue}>fulano@exemplo.com</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="phone" size={20} color="#4F6AF5" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Telefone</Text>
              <Text style={styles.infoValue}>(11) 98765-4321</Text>
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
            onPress={() => {}} 
            variant="primary"
          />
        </View>
      </ScrollView>
    </MainLayout>
  );
}
