import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { firebase } from './config/firebaseConfig';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import CartScreen from './screens/CartScreen';
import styles from './styles/styles';


// ==================== APP COMPONENT ====================
export default function ShopEZApp() {
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [user, setUser] = useState(null);
  const [navigationParams, setNavigationParams] = useState({});

  useEffect(() => {
    firebase.loadFromStorage().then(() => {
      const unsubscribe = firebase.onAuthStateChanged((authUser) => {
        setUser(authUser);
        if (authUser) {
          setCurrentScreen('products');
        } else if (currentScreen === 'loading') {
          setCurrentScreen('login');
        }
      });
      return unsubscribe;
    });
  }, []);

  const navigate = (screen, params = {}) => {
    setNavigationParams(params);
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return <LoadingScreen />;
      case 'login':
        return <LoginScreen navigate={navigate} />;
      case 'register':
        return <RegisterScreen navigate={navigate} />;
      case 'products':
        return <ProductListScreen navigate={navigate} user={user} />;
      case 'productDetail':
        return <ProductDetailScreen navigate={navigate} user={user} product={navigationParams.product} />;
      case 'cart':
        return <CartScreen navigate={navigate} user={user} />;
      default:
        return <LoginScreen navigate={navigate} />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

function LoadingScreen() {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text style={styles.loadingText}>Loading ShopEZ...</Text>
    </View>
  );
}



