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

function handleError(error: any, path: string, operation: string, data?: any) {
  if (error?.code === 'permission-denied') {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path,
        operation,
        requestResourceData: data,
      })
    );
  }
  throw error;
}

export async function setDocumentNonBlocking(
  docRef: DocumentReference,
  data: any,
  options?: SetOptions
) {
  try {
    options ? await setDoc(docRef, data, options)
            : await setDoc(docRef, data);
  } catch (error) {
    handleError(error, docRef.path, options ? 'update' : 'create', data);
  }
}

export async function addDocumentNonBlocking(
  colRef: CollectionReference,
  data: any
) {
  try {
    return await addDoc(colRef, data);
  } catch (error) {
    handleError(error, colRef.path, 'create', data);
  }
}

export async function updateDocumentNonBlocking(
  docRef: DocumentReference,
  data: any
) {
  try {
    await updateDoc(docRef, data);
  } catch (error) {
    handleError(error, docRef.path, 'update', data);
  }
}

export async function deleteDocumentNonBlocking(
  docRef: DocumentReference
) {
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleError(error, docRef.path, 'delete');
  }
}