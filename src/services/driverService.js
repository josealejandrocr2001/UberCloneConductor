// AI-assisted: see docs/AI_LOG.md #2
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { COMMISSION_RATE } from '../config/pricing';
import { requiresTechReview } from '../utils/validators';
import { isCloudinaryConfigured, uploadImages } from './cloudinaryService';

export const DRIVER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
};

/**
 * Crea la cuenta en Firebase Auth y guarda el perfil del conductor en Firestore
 * (colección "drivers", documento con el uid). La cuenta queda Pendiente de aprobación.
 * Las fotos se suben a Cloudinary y en Firestore solo se guarda su URL pública.
 */
export async function registerDriver({ personal, vehicle, documents }, { onProgress } = {}) {
  // AI-assisted: see docs/AI_LOG.md #9 — las fotos se suben a Cloudinary antes de guardar el perfil
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary no está configurado: revisa EXPO_PUBLIC_CLOUDINARY_* en el archivo .env');
  }

  const email = personal.email.trim().toLowerCase();
  const { user } = await createUserWithEmailAndPassword(auth, email, personal.password);

  let photos;
  try {
    photos = await uploadImages(
      {
        profile: personal.photo,
        vehicle: vehicle.photo,
        license: documents.licensePhoto,
        soat: documents.soatPhoto,
        techReview: requiresTechReview(vehicle.year) ? documents.techReviewPhoto : null,
      },
      onProgress,
    );
  } catch (error) {
    // Si las fotos no suben, se elimina la cuenta recién creada para que el conductor pueda reintentar
    await user.delete().catch(() => {});
    throw new Error(`No se pudieron subir las fotos (${error.message}). Revisa tu conexión e intenta de nuevo.`);
  }

  // La contraseña NUNCA se guarda en la base de datos (la maneja Firebase Auth)
  await setDoc(doc(db, 'drivers', user.uid), {
    personal: {
      photo: photos.profile, // URL pública de Cloudinary
      fullName: personal.fullName.trim(),
      document: personal.document,
      phone: personal.phone,
      birthDate: personal.birthDate,
      gender: personal.gender,
      email,
      language: personal.language,
    },
    vehicle: {
      category: vehicle.category,
      plate: vehicle.plate.toUpperCase(),
      brand: vehicle.brand.trim(),
      model: vehicle.model.trim(),
      year: Number(vehicle.year),
      color: vehicle.color,
      capacity: Number(vehicle.capacity),
      photo: photos.vehicle,
    },
    documents: {
      licenseNumber: documents.licenseNumber,
      licensePhoto: photos.license,
      licenseExpiry: documents.licenseExpiry,
      soatPhoto: photos.soat,
      soatExpiry: documents.soatExpiry,
      techReviewRequired: requiresTechReview(vehicle.year),
      techReviewPhoto: photos.techReview,
      techReviewExpiry: documents.techReviewExpiry,
    },
    // Solo el correo de Mercado Pago: nunca números de cuenta ni de tarjeta
    mercadoPagoEmail: documents.mercadoPagoEmail.trim().toLowerCase(),
    acceptedTerms: true,
    commissionRate: COMMISSION_RATE,
    status: DRIVER_STATUS.PENDING,
    available: false,
    balance: 0, // saldo simulado del conductor (sección 4)
    activeTripId: null,
    createdAt: serverTimestamp(),
  });

  return user;
}

// ---------- Estado del conductor en Firestore ----------
// AI-assisted: see docs/AI_LOG.md #7

export function updateDriverLocation(uid, coords) {
  return updateDoc(doc(db, 'drivers', uid), {
    location: { lat: coords.latitude, lng: coords.longitude, heading: coords.heading ?? null, updatedAt: serverTimestamp() },
  });
}

export function setDriverAvailability(uid, available) {
  return updateDoc(doc(db, 'drivers', uid), { available });
}

// Solo campos editables desde el perfil (nunca el estado de aprobación)
export function updateDriverProfile(uid, { fullName, phone, language, mercadoPagoEmail, vehicleColor }) {
  return updateDoc(doc(db, 'drivers', uid), {
    'personal.fullName': fullName.trim(),
    'personal.phone': phone,
    'personal.language': language,
    'vehicle.color': vehicleColor,
    mercadoPagoEmail: mercadoPagoEmail.trim().toLowerCase(),
  });
}
