import { firebase } from '../config/firebaseConfig';
import { validateEmail } from '../utils/validation';
import styles from '../styles/styles';

function LoadingScreen() {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text style={styles.loadingText}>Loading ShopEZ...</Text>
    </View>
  );
}
export default LoadingScreen;