import { CheckCircle2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { BookDetailModal } from './components/BookDetailModal';
import { CollectionFormValues } from './components/CollectionFormModal';
import { CollectionReaderModal } from './components/CollectionReaderModal';
import { MemberPortal } from './components/MemberPortal';
import { Navbar } from './components/Navbar';
import {
  AdminTab,
  CollectionItem,
  LibraryState,
  MemberTab,
  Transaction,
  UserRole,
} from './types/library';
import {
  addDaysISO,
  getTodayISO,
  loadLibraryState,
  resetLibraryState,
  saveLibraryState,
  STORAGE_KEY,
} from './utils/libraryHelpers';

interface ToastMessage {
  id: number;
  text: string;
  tone: 'success' | 'info';
}

export default function App() {
  const [state, setState] = useState<LibraryState>(() => loadLibraryState());
  const [memberTab, setMemberTab] = useState<MemberTab>('opac');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [selectedBook, setSelectedBook] = useState<CollectionItem | null>(null);
  const [readerBook, setReaderBook] = useState<CollectionItem | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((text: string, tone: 'success' | 'info' = 'success') => {
    setToast({ id: Date.now(), text, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Persist every state mutation to localStorage
  useEffect(() => {
    saveLibraryState(state);
  }, [state]);

  // Cross-tab synchronization via storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue) as LibraryState;
          if (updated && Array.isArray(updated.collections)) {
            setState(updated);
          }
        } catch {
          // Ignore malformed external storage payloads
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const activeMember = useMemo(() => {
    return (
      state.members.find((m) => m.id === state.activeMemberId) ??
      state.members[0]
    );
  }, [state.members, state.activeMemberId]);

  const handleRoleChange = (role: UserRole) => {
    setState((prev) => ({ ...prev, activeRole: role }));
  };

  const handleSelectMember = (memberId: string) => {
    setState((prev) => ({ ...prev, activeMemberId: memberId }));
  };

  // Borrow Collection (Member Side) -> 7 days due date, decrements availableCopies
  const handleBorrowCollection = (collectionId: string) => {
    const target = state.collections.find((c) => c.id === collectionId);
    if (!target || target.availableCopies <= 0) return;

    const alreadyActive = state.transactions.some(
      (t) =>
        t.memberId === activeMember.id &&
        t.collectionId === collectionId &&
        t.status === 'active'
    );
    if (alreadyActive) return;

    const todayISO = getTodayISO();
    const dueISO = addDaysISO(todayISO, 7);
    const nextSeq = state.transactions.length + 101;
    const newTrx: Transaction = {
      id: `TRX-${new Date().getFullYear()}-${nextSeq}`,
      memberId: activeMember.id,
      collectionId,
      borrowDate: todayISO,
      dueDate: dueISO,
      returnDate: null,
      status: 'active',
    };

    setState((prev) => ({
      ...prev,
      collections: prev.collections.map((c) =>
        c.id === collectionId
          ? { ...c, availableCopies: Math.max(0, c.availableCopies - 1) }
          : c
      ),
      transactions: [newTrx, ...prev.transactions],
    }));

    setSelectedBook((prev) =>
      prev && prev.id === collectionId
        ? { ...prev, availableCopies: Math.max(0, prev.availableCopies - 1) }
        : prev
    );

    showToast(
      `"${target.title}" berhasil dipinjam. Jatuh tempo 7 hari ke depan.`
    );
  };

  // Return Loan (Member Return or Admin Verification)
  const handleReturnLoan = (transactionId: string) => {
    const trx = state.transactions.find((t) => t.id === transactionId);
    if (!trx || trx.status === 'returned') return;

    const todayISO = getTodayISO();
    const col = state.collections.find((c) => c.id === trx.collectionId);

    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.id === transactionId
          ? { ...t, status: 'returned', returnDate: todayISO }
          : t
      ),
      collections: prev.collections.map((c) =>
        c.id === trx.collectionId
          ? {
              ...c,
              availableCopies: Math.min(c.totalCopies, c.availableCopies + 1),
            }
          : c
      ),
    }));

    showToast(
      `Pengembalian "${col?.title ?? trx.id}" berhasil diverifikasi.`
    );
  };

  // Admin: Add New Collection
  const handleAddCollection = (values: CollectionFormValues) => {
    const newCol: CollectionItem = {
      id: `col-${Date.now()}`,
      title: values.title,
      author: values.author,
      publisher: values.publisher,
      year: values.year,
      isbnIssn: values.isbnIssn,
      ddcNumber: values.ddcNumber,
      ddcCategory: values.ddcCategory,
      callNumber: values.callNumber,
      format: values.format,
      subject: values.subject,
      totalCopies: values.totalCopies,
      availableCopies: values.totalCopies,
      synopsis: values.synopsis,
      shelfLocation: values.shelfLocation,
      durationOrPages: values.durationOrPages,
      sampleExcerpt: `Cuplikan isi koleksi "${values.title}" karya ${values.author}. ${values.synopsis}`,
      createdAt: getTodayISO(),
    };

    setState((prev) => ({
      ...prev,
      collections: [newCol, ...prev.collections],
    }));
    showToast(`Koleksi "${newCol.title}" ditambahkan ke katalog OPAC.`);
  };

  // Admin: Update Existing Collection
  const handleUpdateCollection = (
    collectionId: string,
    values: CollectionFormValues
  ) => {
    const activeBorrowed = state.transactions.filter(
      (t) => t.collectionId === collectionId && t.status === 'active'
    ).length;

    setState((prev) => ({
      ...prev,
      collections: prev.collections.map((item) => {
        if (item.id !== collectionId) return item;
        const safeTotal = Math.max(values.totalCopies, activeBorrowed);
        const safeAvailable = Math.max(0, safeTotal - activeBorrowed);
        return {
          ...item,
          ...values,
          totalCopies: safeTotal,
          availableCopies: safeAvailable,
        };
      }),
    }));

    showToast(`Data koleksi "${values.title}" berhasil diperbarui.`);
  };

  // Admin: Delete Collection
  const handleDeleteCollection = (collectionId: string) => {
    const target = state.collections.find((c) => c.id === collectionId);
    setState((prev) => ({
      ...prev,
      collections: prev.collections.filter((c) => c.id !== collectionId),
    }));
    if (selectedBook?.id === collectionId) setSelectedBook(null);
    showToast(`Koleksi "${target?.title ?? ''}" dihapus dari katalog.`, 'info');
  };

  // Admin: Reset Seed Data
  const handleResetSeedData = () => {
    const fresh = resetLibraryState();
    setState(fresh);
    showToast('Data simulasi awal berhasil dipulihkan.', 'info');
  };

  const isSelectedBookBorrowedByActiveMember = useMemo(() => {
    if (!selectedBook) return false;
    return state.transactions.some(
      (t) =>
        t.memberId === activeMember.id &&
        t.collectionId === selectedBook.id &&
        t.status === 'active'
    );
  }, [selectedBook, state.transactions, activeMember.id]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Navbar
        activeRole={state.activeRole}
        onRoleChange={handleRoleChange}
        memberTab={memberTab}
        onMemberTabChange={setMemberTab}
        adminTab={adminTab}
        onAdminTabChange={setAdminTab}
      />

      <div className="flex-1">
        {state.activeRole === 'member' ? (
          <MemberPortal
            activeTab={memberTab}
            onTabChange={setMemberTab}
            collections={state.collections}
            members={state.members}
            activeMember={activeMember}
            onSelectMember={handleSelectMember}
            transactions={state.transactions}
            onSelectCollection={(item) => setSelectedBook(item)}
            onReturnLoan={handleReturnLoan}
            onOpenReader={(item) => setReaderBook(item)}
          />
        ) : (
          <AdminDashboard
            activeTab={adminTab}
            collections={state.collections}
            members={state.members}
            transactions={state.transactions}
            onVerifyReturn={handleReturnLoan}
            onAddCollection={handleAddCollection}
            onUpdateCollection={handleUpdateCollection}
            onDeleteCollection={handleDeleteCollection}
            onResetSeedData={handleResetSeedData}
          />
        )}
      </div>

      <footer className="no-print border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>
            <strong className="font-semibold text-[#0F172A]">LibraRyan</strong> · Sistem
            Informasi Perpustakaan Digital Terintegrasi
          </p>
          <p>Klasifikasi Dewey Decimal (DDC 000–900) · Sinkronisasi Real-Time Multi-Peran</p>
        </div>
      </footer>

      {/* Bibliographic Detail & Borrowing Modal */}
      <BookDetailModal
        item={selectedBook}
        activeMember={activeMember}
        isAlreadyBorrowedByMember={isSelectedBookBorrowedByActiveMember}
        onClose={() => setSelectedBook(null)}
        onBorrow={handleBorrowCollection}
        onOpenReader={(item) => setReaderBook(item)}
      />

      {/* Digital Reader / Audio Player / Shelf Guide Modal */}
      <CollectionReaderModal item={readerBook} onClose={() => setReaderBook(null)} />

      {/* Non-intrusive Feedback Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-[#0F172A] px-4 py-3 text-xs font-medium text-white shadow-lg"
        >
          <CheckCircle2
            className={`h-4 w-4 shrink-0 ${
              toast.tone === 'success' ? 'text-emerald-400' : 'text-blue-400'
            }`}
            aria-hidden="true"
          />
          <span className="leading-snug">{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="ml-1 rounded p-0.5 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
