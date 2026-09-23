import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import { auth } from './auth';
import { Transaction, BudgetConfig, SheetConfig, UserProfile } from '../types';

export const db = getFirestore(auth.app);

export const APP_NAME = 'Personal Expense Tracker Allin';

/**
 * Validates connection to Firestore on initialization
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline mode or network is unreachable.');
    }
    return false;
  }
}

// Run connection check
testFirestoreConnection();

/**
 * Saves or updates user profile in Firestore
 */
export async function syncUserProfileToFirestore(user: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        appName: APP_NAME,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to sync user profile to Firestore:', err);
  }
}

/**
 * Saves a single transaction to Firestore
 */
export async function saveTransactionToFirestore(userId: string, tx: Transaction): Promise<void> {
  if (!userId) return;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', tx.id);
    await setDoc(txRef, {
      ...tx,
      userId,
      appName: APP_NAME,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('Failed to save transaction to Firestore:', err);
    throw err;
  }
}

/**
 * Deletes a transaction from Firestore
 */
export async function deleteTransactionFromFirestore(userId: string, txId: string): Promise<void> {
  if (!userId || !txId) return;
  try {
    const txRef = doc(db, 'users', userId, 'transactions', txId);
    await deleteDoc(txRef);
  } catch (err) {
    console.error('Failed to delete transaction from Firestore:', err);
    throw err;
  }
}

/**
 * Loads all transactions for a user from Firestore
 */
export async function loadTransactionsFromFirestore(userId: string): Promise<Transaction[]> {
  if (!userId) return [];
  try {
    const colRef = collection(db, 'users', userId, 'transactions');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const txs: Transaction[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      txs.push({
        id: data.id || docSnap.id,
        date: data.date,
        time: data.time || '12:00',
        type: data.type,
        category: data.category,
        description: data.description,
        amount: Number(data.amount) || 0,
        paymentMethod: data.paymentMethod || 'cash',
        merchant: data.merchant || '',
        notes: data.notes || '',
        syncedToSheet: Boolean(data.syncedToSheet),
        createdAt: data.createdAt || Date.now(),
      });
    });
    return txs;
  } catch (err) {
    console.error('Failed to load transactions from Firestore:', err);
    return [];
  }
}

/**
 * Subscribes to real-time transaction updates from Firestore
 */
export function subscribeTransactionsFromFirestore(
  userId: string,
  onUpdate: (transactions: Transaction[]) => void
) {
  if (!userId) return () => {};
  const colRef = collection(db, 'users', userId, 'transactions');
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        txs.push({
          id: data.id || docSnap.id,
          date: data.date,
          time: data.time || '12:00',
          type: data.type,
          category: data.category,
          description: data.description,
          amount: Number(data.amount) || 0,
          paymentMethod: data.paymentMethod || 'cash',
          merchant: data.merchant || '',
          notes: data.notes || '',
          syncedToSheet: Boolean(data.syncedToSheet),
          createdAt: data.createdAt || Date.now(),
        });
      });
      onUpdate(txs);
    },
    (err) => {
      console.warn('Realtime Firestore subscription error:', err);
    }
  );
}

/**
 * Batch upload local transactions to Firestore
 */
export async function batchSyncLocalTransactionsToFirestore(
  userId: string,
  localTransactions: Transaction[]
): Promise<number> {
  if (!userId || localTransactions.length === 0) return 0;
  try {
    // Commit up to 450 transactions in batch with merge
    const batch = writeBatch(db);
    const slice = localTransactions.slice(0, 450);
    slice.forEach((tx) => {
      const txRef = doc(db, 'users', userId, 'transactions', tx.id);
      batch.set(
        txRef,
        {
          ...tx,
          userId,
          appName: APP_NAME,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    });

    await batch.commit();
    return slice.length;
  } catch (err) {
    console.error('Failed to batch sync local transactions to Firestore:', err);
    throw err;
  }
}

/**
 * Saves budget configuration to Firestore
 */
export async function saveBudgetToFirestore(userId: string, budget: BudgetConfig): Promise<void> {
  if (!userId) return;
  try {
    const ref = doc(db, 'users', userId, 'settings', 'budget');
    await setDoc(ref, {
      ...budget,
      userId,
      appName: APP_NAME,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.error('Failed to save budget to Firestore:', err);
  }
}

/**
 * Loads budget configuration from Firestore
 */
export async function loadBudgetFromFirestore(userId: string): Promise<BudgetConfig | null> {
  if (!userId || !auth.currentUser || auth.currentUser.uid !== userId) return null;
  try {
    const ref = doc(db, 'users', userId, 'settings', 'budget');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as BudgetConfig;
    }
    return null;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      console.warn('Budget not accessible or user not yet authorized in Firestore rules');
    } else {
      console.warn('Failed to load budget from Firestore:', err);
    }
    return null;
  }
}

/**
 * Saves Google Sheet configuration to Firestore
 */
export async function saveSheetConfigToFirestore(userId: string, config: SheetConfig): Promise<void> {
  if (!userId || !auth.currentUser || auth.currentUser.uid !== userId) return;
  try {
    const ref = doc(db, 'users', userId, 'settings', 'sheet');
    await setDoc(ref, {
      ...config,
      userId,
      appName: APP_NAME,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.warn('Failed to save sheet config to Firestore:', err);
  }
}

/**
 * Loads Google Sheet configuration from Firestore
 */
export async function loadSheetConfigFromFirestore(userId: string): Promise<SheetConfig | null> {
  if (!userId || !auth.currentUser || auth.currentUser.uid !== userId) return null;
  try {
    const ref = doc(db, 'users', userId, 'settings', 'sheet');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as SheetConfig;
    }
    return null;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      console.warn('Sheet config not accessible or user not yet authorized in Firestore rules');
    } else {
      console.warn('Failed to load sheet config from Firestore:', err);
    }
    return null;
  }
}
