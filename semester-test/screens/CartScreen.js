import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Image,
  ActivityIndicator
} from 'react-native';
import { firebase, AsyncStorage } from '../config/firebaseConfig';
import styles from '../styles/styles';

// ==================== CART SCREEN ====================
function CartScreen({ navigate, user }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      // Try to load from Firebase
      const cartData = await firebase.ref(`carts/${user.uid}`).once();
      let cartItems = cartData.val();

      // If offline, try AsyncStorage
      if (!cartItems) {
        const localCart = await AsyncStorage.getItem(`cart_${user.uid}`);
        cartItems = localCart ? JSON.parse(localCart) : {};
      }

      const cartArray = Object.values(cartItems || {});
      setCart(cartArray);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);

    const cartObj = {};
    updatedCart.forEach(item => {
      cartObj[item.id] = item;
    });

    await firebase.ref(`carts/${user.uid}`).set(cartObj);
    await AsyncStorage.setItem(`cart_${user.uid}`, JSON.stringify(cartObj));
  };

  const removeItem = async (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);

    const cartObj = {};
    updatedCart.forEach(item => {
      cartObj[item.id] = item;
    });

    await firebase.ref(`carts/${user.uid}`).set(cartObj);
    await AsyncStorage.setItem(`cart_${user.uid}`, JSON.stringify(cartObj));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('products')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={{ width: 40 }} />
      </View>

      {cart.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigate('products')}>
            <Text style={styles.buttonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.cartList}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                <View style={styles.cartItemDetails}>
                  <Text style={styles.cartItemTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.cartItemPrice}>${item.price.toFixed(2)}</Text>
                  <View style={styles.cartItemControls}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButtonSmall}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityValue}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButtonSmall}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Text style={styles.removeButton}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cartItemSubtotal}>
                    Subtotal: ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          />
          
          <View style={styles.cartFooter}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={[styles.button, styles.checkoutButton]}>
              <Text style={styles.buttonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
export default CartScreen;