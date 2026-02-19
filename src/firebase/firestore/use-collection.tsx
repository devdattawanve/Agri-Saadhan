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
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * React hook to subscribe to Firestore collection/query
 */
export function useCollection<T = any>(
  memoizedTargetRefOrQuery:
    | Query<DocumentData>
    | CollectionReference<DocumentData>
    | null
    | undefined
): UseCollectionResult<T> {
  type StateDataType = WithId<T>[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map((doc) => ({
          ...(doc.data() as T),
          id: doc.id,
        }));
        setData(docs);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        console.error('Firestore Error:', err);

        // Safely get the path for the error message.
        // If the query is a CollectionReference, it will have a 'path' property.
        // For other queries, we'll use a placeholder. This prevents a runtime crash.
        const path = (memoizedTargetRefOrQuery as CollectionReference)?.path || 'unknown-query-path';

        if (err.code === 'permission-denied') {
          const contextualError = new FirestorePermissionError({
            operation: 'list',
            path,
          });
          setError(contextualError);
          errorEmitter.emit('permission-error', contextualError);
        } else {
          setError(err);
        }

        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}
