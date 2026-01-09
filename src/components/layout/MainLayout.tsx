import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_BAR_HEIGHT = 70;
const ANDROID_BOTTOM_PADDING = Platform.OS === 'android' ? 40 : 0;
const MENU_HEIGHT = SCREEN_HEIGHT * 0.75;

interface MainLayoutProps {
  children: React.ReactNode;
  navigation?: any;
}

export default function MainLayout({ children, navigation }: MainLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuPosition = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setIsMenuOpen(true);
    Animated.spring(menuPosition, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const closeMenu = () => {
    Animated.spring(menuPosition, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start(() => setIsMenuOpen(false));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Arrastar para baixo
          const progress = Math.max(0, Math.min(1, 1 - gestureState.dy / MENU_HEIGHT));
          menuPosition.setValue(progress);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Se arrastar mais de 50px ou velocidade alta, fecha
        if (gestureState.dy > 50 || gestureState.vy > 0.5) {
          closeMenu();
        } else {
          // Volta para aberto
          openMenu();
        }
      },
    })
  ).current;

  const menuTranslateY = menuPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [MENU_HEIGHT, 0],
  });

  const overlayOpacity = menuPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const menuItems = [
    { icon: 'home', label: 'Início', screen: 'Home' },
    { icon: 'file-sign', label: 'Assinatura', screen: 'Assinatura' },
    { icon: 'sitemap', label: 'BPMS', screen: 'BPMS' },
    { icon: 'cloud', label: 'Nuvem', screen: 'Cloud' },
    { icon: 'server', label: 'Ambientes', screen: 'Environments' },
    { icon: 'account', label: 'Perfil', screen: 'Profile' },
    { icon: 'exit-to-app', label: 'Sair', screen: 'Login', isLogout: true },
  ];

  const handleMenuItemPress = (item: any) => {
    closeMenu();
    setTimeout(() => {
      if (navigation) {
        if (item.isLogout) {
          navigation.replace(item.screen);
        } else {
          navigation.navigate(item.screen);
        }
      }
    }, 300);
  };

  return (
    <View style={styles.container}>
      {/* Fundo preto para Android */}
      {Platform.OS === 'android' && (
        <View style={styles.androidBottomBackground} />
      )}

      {/* Conteúdo principal */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Overlay escuro quando menu está aberto */}
      {isMenuOpen && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <Animated.View
            style={[
              styles.overlay,
              {
                opacity: overlayOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Menu deslizante */}
      {isMenuOpen && (
        <Animated.View
          style={[
            styles.menu,
            {
              transform: [{ translateY: menuTranslateY }],
            },
          ]}
        >
        {/* Handle do menu */}
        <View style={styles.menuHandle} {...panResponder.panHandlers}>
          <View style={styles.handleBar} />
        </View>

        {/* Itens do menu */}
        <ScrollView 
          style={styles.menuContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Text style={styles.menuTitle}>Menu de Navegação</Text>
          
          <View style={styles.menuItems}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  item.isLogout && styles.menuItemLogout,
                ]}
                onPress={() => handleMenuItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.menuItemIcon,
                  item.isLogout && styles.menuItemIconLogout,
                ]}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={24}
                    color={item.isLogout ? '#ef4444' : '#4F6AF5'}
                  />
                </View>
                <Text style={[
                  styles.menuItemLabel,
                  item.isLogout && styles.menuItemLabelLogout,
                ]}>
                  {item.label}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        </Animated.View>
      )}

      {/* Barra inferior fixa */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.bottomButton} 
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('Home')}
        >
          <MaterialCommunityIcons name="home" size={24} color="#666" />
          <Text style={styles.bottomButtonText}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bottomButton} 
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('Assinatura')}
        >
          <MaterialCommunityIcons name="file-document" size={24} color="#666" />
          <Text style={styles.bottomButtonText}>Docs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomButtonMenu}
          onPress={isMenuOpen ? closeMenu : openMenu}
          activeOpacity={0.9}
        >
          <View style={styles.menuButtonCircle}>
            <MaterialCommunityIcons name="menu" size={28} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bottomButton} 
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('Cloud')}
        >
          <MaterialCommunityIcons name="cloud" size={24} color="#666" />
          <Text style={styles.bottomButtonText}>Nuvem</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.bottomButton} 
          activeOpacity={0.7}
          onPress={() => navigation?.navigate('Profile')}
        >
          <MaterialCommunityIcons name="account" size={24} color="#666" />
          <Text style={styles.bottomButtonText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  androidBottomBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ANDROID_BOTTOM_PADDING,
    backgroundColor: '#000',
    zIndex: 4,
    pointerEvents: 'none',
  },
  content: {
    flex: 1,
    marginBottom: BOTTOM_BAR_HEIGHT + ANDROID_BOTTOM_PADDING,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1,
  },
  menu: {
    position: 'absolute',
    bottom: ANDROID_BOTTOM_PADDING,
    left: 0,
    right: 0,
    height: MENU_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 2,
    paddingBottom: BOTTOM_BAR_HEIGHT,
  },
  menuHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  menuItems: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  menuItemLogout: {
    backgroundColor: '#fef2f2',
    marginTop: 20,
  },
  menuItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 106, 245, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemIconLogout: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  menuItemLabelLogout: {
    color: '#ef4444',
  },
  bottomBar: {
    position: 'absolute',
    bottom: ANDROID_BOTTOM_PADDING,
    left: 0,
    right: 0,
    height: BOTTOM_BAR_HEIGHT,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 3,
  },
  bottomButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  bottomButtonText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  bottomButtonMenu: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -25,
  },
  menuButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F6AF5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F6AF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
