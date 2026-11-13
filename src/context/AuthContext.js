// AI-assisted: see docs/AI_LOG.md #1, #7
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Sesión del conductor: usuario de Firebase Auth + su perfil de Firestore (en tiempo real)
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [driver, setDriver] = useState(null);
  const [driverLoading, setDriverLoading] = useState(true);

  useEffect(() => {
    // Escucha los cambios de sesión; la función retornada es la limpieza
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setDriver(null);
      setDriverLoading(false);
      return undefined;
    }
    setDriverLoading(true);
    // Perfil en tiempo real: si el estado cambia a "approved" en Firestore, la app se entera sola
    const unsubscribe = onSnapshot(
      doc(db, 'drivers', user.uid),
      (snapshot) => {
        setDriver(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        setDriverLoading(false);
      },
      () => setDriverLoading(false),
    );
    return unsubscribe;
  }, [user]);

  const login = (email, password) => signInWithEmailAndPassword(auth, email.trim(), password);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, initializing, driver, driverLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
