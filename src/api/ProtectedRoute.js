// src/ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setLoggedIn(!!user);
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  if (checking) return null; // or a spinner

  return loggedIn ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
