import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Customer,
  Deal,
  Department,
  Employee,
  FinanceEntry,
  HrRequest,
  MarketingItem,
  Meeting,
  SalesDoc,
  Workspace,
} from '../types';
import { bootstrapWorkspace } from '../data/seedWorkspace';
import { sanitizeId } from '../utils/format';

export type SubcollectionName =
  | 'employees'
  | 'departments'
  | 'hrRequests'
  | 'customers'
  | 'meetings'
  | 'deals'
  | 'salesDocs'
  | 'marketingItems'
  | 'financeEntries';

export interface WorkspaceDataState {
  workspace: Workspace | null;
  employees: Employee[];
  departments: Department[];
  hrRequests: HrRequest[];
  customers: Customer[];
  meetings: Meeting[];
  deals: Deal[];
  salesDocs: SalesDoc[];
  marketingItems: MarketingItem[];
  financeEntries: FinanceEntry[];
  loading: boolean;
  error: string | null;
}

export function useWorkspaceData(uid: string | null, displayName: string, pendingCompanyName?: string) {
  const [state, setState] = useState<WorkspaceDataState>({
    workspace: null,
    employees: [],
    departments: [],
    hrRequests: [],
    customers: [],
    meetings: [],
    deals: [],
    salesDocs: [],
    marketingItems: [],
    financeEntries: [],
    loading: Boolean(uid),
    error: null,
  });

  useEffect(() => {
    if (!uid) {
      setState((prev) => ({ ...prev, workspace: null, loading: false, error: null }));
      return;
    }

    let cancelled = false;
    const workspaceId = sanitizeId(`ws_${uid}`);
    const wsRef = doc(db, 'workspaces', workspaceId);
    const unsubs: Array<() => void> = [];
    let seededAttempted = false;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const unsubWs = onSnapshot(
      wsRef,
      async (snap) => {
        if (cancelled) return;
        if (!snap.exists()) {
          if (!seededAttempted) {
            seededAttempted = true;
            try {
              await bootstrapWorkspace(uid, displayName, pendingCompanyName);
            } catch (err) {
              if (!cancelled) {
                setState((prev) => ({
                  ...prev,
                  loading: false,
                  error: err instanceof Error ? err.message : 'Failed to initialize workspace.',
                }));
              }
            }
          }
          return;
        }
        const data = snap.data() as Omit<Workspace, 'id'>;
        setState((prev) => ({
          ...prev,
          workspace: { id: snap.id, ...data },
          loading: false,
        }));
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `workspaces/${workspaceId}`);
      }
    );
    unsubs.push(unsubWs);

    const subscribeCol = <T extends { id: string }>(
      subcol: SubcollectionName,
      key: keyof WorkspaceDataState
    ) => {
      const colPath = `workspaces/${workspaceId}/${subcol}`;
      const q = query(collection(db, colPath), where('ownerId', '==', uid));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          if (cancelled) return;
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
          setState((prev) => ({ ...prev, [key]: items }));
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, colPath);
        }
      );
      unsubs.push(unsub);
    };

    subscribeCol<Employee>('employees', 'employees');
    subscribeCol<Department>('departments', 'departments');
    subscribeCol<HrRequest>('hrRequests', 'hrRequests');
    subscribeCol<Customer>('customers', 'customers');
    subscribeCol<Meeting>('meetings', 'meetings');
    subscribeCol<Deal>('deals', 'deals');
    subscribeCol<SalesDoc>('salesDocs', 'salesDocs');
    subscribeCol<MarketingItem>('marketingItems', 'marketingItems');
    subscribeCol<FinanceEntry>('financeEntries', 'financeEntries');

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, [uid, displayName, pendingCompanyName]);

  const workspaceId = uid ? sanitizeId(`ws_${uid}`) : '';

  const updateWorkspace = async (patch: Partial<Workspace>) => {
    if (!uid || !workspaceId) return;
    const path = `workspaces/${workspaceId}`;
    try {
      const { id: _id, ownerId: _owner, createdAt: _ca, ...safePatch } = patch;
      await updateDoc(doc(db, 'workspaces', workspaceId), {
        ...safePatch,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const createRecord = async (subcol: SubcollectionName, payload: Record<string, unknown>) => {
    if (!uid || !workspaceId) return;
    const colPath = `workspaces/${workspaceId}/${subcol}`;
    try {
      await addDoc(collection(db, colPath), {
        ...payload,
        ownerId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, colPath);
    }
  };

  const updateRecord = async (
    subcol: SubcollectionName,
    id: string,
    patch: Record<string, unknown>
  ) => {
    if (!uid || !workspaceId) return;
    const docPath = `workspaces/${workspaceId}/${subcol}/${id}`;
    try {
      const { id: _id, ownerId: _owner, createdAt: _ca, ...safePatch } = patch;
      await updateDoc(doc(db, 'workspaces', workspaceId, subcol, id), {
        ...safePatch,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    }
  };

  const deleteRecord = async (subcol: SubcollectionName, id: string) => {
    if (!uid || !workspaceId) return;
    const docPath = `workspaces/${workspaceId}/${subcol}/${id}`;
    try {
      await deleteDoc(doc(db, 'workspaces', workspaceId, subcol, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  };

  return {
    ...state,
    updateWorkspace,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}
