
// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7tPoTdfXzN21ipz8dCHYxb-Gq8ewHA1A",
  authDomain: "semestertest-2.firebaseapp.com",
  projectId: "semestertest-2",
  storageBucket: "semestertest-2.firebasestorage.app",
  messagingSenderId: "529461914269",
  appId: "1:529461914269:web:10b708183de41b49dec274",
  measurementId: "G-SGMYKN3MR7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);










// ==================== MOCK FIREBASE & STORAGE ====================
// In a real app, import from firebase/app, firebase/auth, firebase/database
class MockFirebase {
  constructor() {
    this.users = {};
    this.currentUser = null;
    this.database = {};
    this.authListeners = [];
  }

  // Auth methods
  async createUserWithEmailAndPassword(email, password) {
    if (this.users[email]) {
      throw new Error('auth/email-already-in-use');
    }
    const user = { uid: Date.now().toString(), email };
    this.users[email] = { ...user, password };
    this.currentUser = user;
    this.notifyAuthListeners();
    return { user };
  }

  async signInWithEmailAndPassword(email, password) {
    const user = this.users[email];
    if (!user || user.password !== password) {
      throw new Error('auth/invalid-credential');
    }
    this.currentUser = { uid: user.uid, email: user.email };
    this.notifyAuthListeners();
    return { user: this.currentUser };
  }

  async signOut() {
    this.currentUser = null;
    this.notifyAuthListeners();
  }

  onAuthStateChanged(callback) {
    this.authListeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== callback);
    };
  }

  notifyAuthListeners() {
    this.authListeners.forEach(listener => listener(this.currentUser));
  }

  // Database methods
  ref(path) {
    return {
      set: async (data) => {
        this.database[path] = data;
        await this.saveToStorage();
      },
      once: async () => ({
        val: () => this.database[path] || null
      }),
      on: (event, callback) => {
        callback({ val: () => this.database[path] || null });
      }
    };
  }

  async saveToStorage() {
    // Mock AsyncStorage save
    if (typeof window !== 'undefined') {
      localStorage.setItem('mockFirebaseDB', JSON.stringify(this.database));
      localStorage.setItem('mockFirebaseUsers', JSON.stringify(this.users));
      localStorage.setItem('mockFirebaseCurrentUser', JSON.stringify(this.currentUser));
    }
  }

  async loadFromStorage() {
    if (typeof window !== 'undefined') {
      const db = localStorage.getItem('mockFirebaseDB');
      const users = localStorage.getItem('mockFirebaseUsers');
      const currentUser = localStorage.getItem('mockFirebaseCurrentUser');
      if (db) this.database = JSON.parse(db);
      if (users) this.users = JSON.parse(users);
      if (currentUser && currentUser !== 'null') {
        this.currentUser = JSON.parse(currentUser);
        this.notifyAuthListeners();
      }
    }
  }
}

const firebase = new MockFirebase();

// Mock AsyncStorage
const AsyncStorage = {
  setItem: async (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  getItem: async (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }
};

export { firebase, AsyncStorage, firebaseConfig };