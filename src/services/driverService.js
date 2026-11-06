// AI-assisted: see docs/AI_LOG.md #2
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { COMMISSION_RATE } from '../config/pricing';
import { requiresTechReview } from '../utils/validators';

export const DRIVER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
};

/**
 * Crea la cuenta en Firebase Auth y guarda el perfil del conductor en Firestore
 * (colección "drivers", documento con el uid). La cuenta queda Pendiente de aprobación.
 * Las fotos se guardan por ahora como URI local; en la siguiente entrega se suben a Cloudinary.
 */
export async function registerDriver({ personal, vehicle, documents }) {
  const email = personal.email.trim().toLowerCase();
  const { user } = await createUserWithEmailAndPassword(auth, email, personal.password);

  // La contraseña NUNCA se guarda en la base de datos (la maneja Firebase Auth)
  await setDoc(doc(db, 'drivers', user.uid), {
    personal: {
      photo: personal.photo,
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
      photo: vehicle.photo,
    },
    documents: {
      licenseNumber: documents.licenseNumber,
      licensePhoto: documents.licensePhoto,
      licenseExpiry: documents.licenseExpiry,
      soatPhoto: documents.soatPhoto,
      soatExpiry: documents.soatExpiry,
      techReviewRequired: requiresTechReview(vehicle.year),
      techReviewPhoto: documents.techReviewPhoto,
      techReviewExpiry: documents.techReviewExpiry,
    },
    // Solo el correo de Mercado Pago: nunca números de cuenta ni de tarjeta
    mercadoPagoEmail: documents.mercadoPagoEmail.trim().toLowerCase(),
    acceptedTerms: true,
    commissionRate: COMMISSION_RATE,
    status: DRIVER_STATUS.PENDING,
    available: false,
    createdAt: serverTimestamp(),
  });

  return user;
}
