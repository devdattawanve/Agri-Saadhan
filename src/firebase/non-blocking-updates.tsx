'use client';

import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// =============================
// SET DOCUMENT
// =============================
export async function setDocumentNonBlocking(
  docRef: DocumentReference,
  data: any,
  options?: SetOptions
) {
  try {
    if (options) {
      await setDoc(docRef, data, options);
    } else {
      await setDoc(docRef, data);
    }
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: options && 'merge' in options ? 'update' : 'create',
        requestResourceData: data,
      })
    );
    throw error;
  }
}

// =============================
// ADD DOCUMENT
// =============================
export async function addDocumentNonBlocking(
  colRef: CollectionReference,
  data: any
) {
  try {
    const docRef = await addDoc(colRef, data);
    return docRef;
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: data,
      })
    );
    throw error;
  }
}

// =============================
// UPDATE DOCUMENT  🔥 FIXED
// =============================
export async function updateDocumentNonBlocking(
  docRef: DocumentReference,
  data: any
) {
  try {
    await updateDoc(docRef, data);
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      })
    );
    throw error; // important
  }
}

// =============================
// DELETE DOCUMENT
// =============================
export async function deleteDocumentNonBlocking(
  docRef: DocumentReference
) {
  try {
    await deleteDoc(docRef);
  } catch (error) {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      })
    );
    throw error;
  }
}