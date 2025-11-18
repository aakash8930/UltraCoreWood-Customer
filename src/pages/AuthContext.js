// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Create the context
const AuthContext = createContext();

// Create a custom hook to easily use the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create the Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    // This listener is the single source of truth for auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // The value that will be available to all children
  const value = {
    user,
    loading,
    isLoggedIn: !loading && !!user // A convenient boolean flag
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};