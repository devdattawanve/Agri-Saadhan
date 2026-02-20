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
        let path = 'unknown-query-path';
        if (memoizedTargetRefOrQuery) {
            // For CollectionReference, the path is public.
            if ('path' in memoizedTargetRefOrQuery && typeof (memoizedTargetRefOrQuery as any).path === 'string') {
                path = (memoizedTargetRefOrQuery as CollectionReference).path;
            } 
            // For complex Queries, we resort to a non-public property.
            // This is not ideal but crucial for debugging. It may break in future SDK updates.
            else if ('_query' in memoizedTargetRefOrQuery) {
                const internalQuery = (memoizedTargetRefOrQuery as any)._query;
                if (internalQuery && internalQuery.path && Array.isArray(internalQuery.path.segments)) {
                    path = internalQuery.path.segments.join('/');
                }
            }
        }

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
