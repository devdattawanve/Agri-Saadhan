'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/* Internal implementation of Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references.
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 * 
 * @template T Optional type for document data. Defaults to any.
 * @param {Query<DocumentData> | CollectionReference<DocumentData> | null | undefined} memoizedTargetRefOrQuery -
 * The Firestore query or collection reference. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
  memoizedTargetRefOrQuery: Query<DocumentData> | CollectionReference<DocumentData> | null | undefined
): UseCollectionResult<T> {
  type StateDataType = WithId<T>[] | null;
  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false); // Not loading if no ref
      setError(null);
      return;
    }

    setIsLoading(true); // Set loading true when we have a ref
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
        setData(docs);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        const path = (memoizedTargetRefOrQuery as CollectionReference<DocumentData>).path 
            ? (memoizedTargetRefOrQuery as CollectionReference<DocumentData>).path
            : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString()

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        })
        
        setError(contextualError)
        setData(null)
        setIsLoading(false)

        // trigger global error propagation
        errorEmitter.emit('permission-error', contextualError);
      }
    );
    
    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]); // Re-run if ref changes

  return { data, isLoading, error };
}
