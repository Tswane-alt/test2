import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { firebase, AsyncStorage } from '../config/firebaseConfig';
import styles from '../styles/styles';

// ==================== PRODUCT DETAIL SCREEN ====================
function ProductDetailScreen({ navigate, user, product }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const addToCart = async () => {
    setLoading(true);
    try {
      const cartRef = firebase.ref(`carts/${user.uid}/${product.id}`);
      const existingItem = await cartRef.once();
      const currentQty = existingItem.val()?.quantity || 0;

      await cartRef.set({
        ...product,
        quantity: currentQty + quantity
      });

      // Save to AsyncStorage
      const cartData = await firebase.ref(`carts/${user.uid}`).once();
      await AsyncStorage.setItem(`cart_${user.uid}`, JSON.stringify(cartData.val()));

      Alert.alert('Success', 'Added to cart!');
    } catch (err) {
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate('products')}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity onPress={() => navigate('cart')}>
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      <Image source={{ uri: product.image }} style={styles.detailImage} />
      
      <View style={styles.detailContent}>
        <Text style={styles.detailTitle}>{product.title}</Text>
        <Text style={styles.detailCategory}>{product.category}</Text>
        <Text style={styles.detailPrice}>${product.price.toFixed(2)}</Text>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>⭐ {product.rating?.rate || 0}</Text>
          <Text style={styles.ratingCount}>({product.rating?.count || 0} reviews)</Text>
        </View>

        <Text style={styles.detailDescription}>{product.description}</Text>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.addToCartButton, loading && styles.buttonDisabled]}
          onPress={addToCart}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
export default ProductDetailScreen;