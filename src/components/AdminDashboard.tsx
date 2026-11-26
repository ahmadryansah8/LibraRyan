import {
  CheckCircle2,
  Download,
  Edit3,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { DDC_CATEGORIES } from '../data/seedData';
import {
  AdminTab,
  CollectionItem,
  DDCCode,
  Member,
  ReportPeriod,
  Transaction,
  TransactionDisplayStatus,
} from '../types/library';
import {
  exportCirculationReportCSV,
  formatIndonesianDate,
  getOverdueDays,
  getTodayISO,
  getTransactionDisplayStatus,
} from '../utils/libraryHelpers';
import { AdminCharts } from './AdminCharts';
import { CollectionFormModal, CollectionFormValues } from './CollectionFormModal';
import { AvailabilityTag, TransactionStatusTag } from './StatusBadge';

interface AdminDashboardProps {
  activeTab: AdminTab;
  collections: CollectionItem[];
  members: Member[];
  transactions: Transaction[];
  onVerifyReturn: (transactionId: string) => void;
  onAddCollection: (values: CollectionFormValues) => void;
  onUpdateCollection: (collectionId: string, values: CollectionFormValues) => void;
  onDeleteCollection: (collectionId: string) => void;
  onResetSeedData: () => void;
}

export function AdminDashboard({
  activeTab,
  collections,
  members,
  transactions,
  onVerifyReturn,
  onAddCollection,
  onUpdateCollection,
  onDeleteCollection,
  onResetSeedData,
}: AdminDashboardProps) {
  // Overview log filters
  const [trxSearch, setTrxSearch] = useState('');
  const [trxStatusFilter, setTrxStatusFilter] = useState<TransactionDisplayStatus | 'ALL'>('ALL');

  // Collection CRUD state
  const [colSearch, setColSearch] = useState('');
  const [colDDCFilter, setColDDCFilter] = useState<DDCCode | 'ALL'>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CollectionItem | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Reporting state
  const todayISO = getTodayISO();
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('monthly');
  const [selectedDay, setSelectedDay] = useState(todayISO);
  const [selectedMonth, setSelectedMonth] = useState(todayISO.slice(0, 7));

  const collectionMap = useMemo(
    () => new Map(collections.map((c) => [c.id, c])),
    [collections]
  );
  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  // Real-Time KPI Metrics
  const metrics = useMemo(() => {
    const totalTitles = collections.length;
    const totalCopies = collections.reduce((sum, item) => sum + item.totalCopies, 0);
    const activeBorrowed = transactions.filter((t) => t.status === 'active').length;
    const overdueBorrowed = transactions.filter(
      (t) => getTransactionDisplayStatus(t) === 'Terlambat'
    ).length;
    const activeMembers = members.filter((m) => m.status === 'Aktif').length;
    const todayTransactions = transactions.filter(
      (t) => t.borrowDate === todayISO || t.returnDate === todayISO
    ).length;

    return {
      totalTitles,
      totalCopies,
      activeBorrowed,
      overdueBorrowed,
      activeMembers,
      todayTransactions,
    };
  }, [collections, transactions, members, todayISO]);

  // Filtered Transactions Log
  const filteredTransactions = useMemo(() => {
    const q = trxSearch.trim().toLowerCase();
    return [...transactions]
      .sort((a, b) => b.borrowDate.localeCompare(a.borrowDate))
      .filter((trx) => {
        const displayStatus = getTransactionDisplayStatus(trx);
        if (trxStatusFilter !== 'ALL' && displayStatus !== trxStatusFilter) return false;
        if (!q) return true;
        const col = collectionMap.get(trx.collectionId);
        const mem = memberMap.get(trx.memberId);
        return (
          trx.id.toLowerCase().includes(q) ||
          (col?.title.toLowerCase().includes(q) ?? false) ||
          (col?.callNumber.toLowerCase().includes(q) ?? false) ||
          (mem?.name.toLowerCase().includes(q) ?? false) ||
          (mem?.memberCode.toLowerCase().includes(q) ?? false)
        );
      });
  }, [transactions, trxSearch, trxStatusFilter, collectionMap, memberMap]);

  // Filtered Collections for CRUD
  const filteredCollections = useMemo(() => {
    const q = colSearch.trim().toLowerCase();
    return collections.filter((item) => {
      if (colDDCFilter !== 'ALL' && item.ddcCategory !== colDDCFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.ddcNumber.toLowerCase().includes(q) ||
        item.callNumber.toLowerCase().includes(q) ||
        item.isbnIssn.toLowerCase().includes(q)
      );
    });
  }, [collections, colSearch, colDDCFilter]);

  // Reporting calculations
  const reportData = useMemo(() => {
    let periodLabel = 'Semua Periode';
    const filtered = transactions.filter((t) => {
      if (reportPeriod === 'daily') {
        return t.borrowDate === selectedDay || t.returnDate === selectedDay;
      }
      if (reportPeriod === 'monthly') {
        return (
          t.borrowDate.startsWith(selectedMonth) ||
          (t.returnDate?.startsWith(selectedMonth) ?? false)
        );
      }
      return true;
    });

    if (reportPeriod === 'daily') {
      periodLabel = `Harian (${formatIndonesianDate(selectedDay)})`;
    } else if (reportPeriod === 'monthly') {
      const [y, m] = selectedMonth.split('-').map(Number);
      const dt = new Date(y, m - 1, 1);
      periodLabel = `Bulanan (${dt.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      })})`;
    }

    const total = filtered.length;
    const returned = filtered.filter((t) => getTransactionDisplayStatus(t) === 'Selesai').length;
    const active = filtered.filter((t) => getTransactionDisplayStatus(t) === 'Aktif').length;
    const overdueList = filtered.filter(
      (t) => getTransactionDisplayStatus(t) === 'Terlambat'
    );

    // Top borrowed collections within filtered transactions
    const counts = new Map<string, number>();
    filtered.forEach((t) => {
      counts.set(t.collectionId, (counts.get(t.collectionId) ?? 0) + 1);
    });

    const topCollections = Array.from(counts.entries())
      .map(([colId, borrowCount]) => ({
        item: collectionMap.get(colId),
        borrowCount,
      }))
      .filter((x): x is { item: CollectionItem; borrowCount: number } => Boolean(x.item))
      .sort((a, b) => b.borrowCount - a.borrowCount);

    return {
      periodLabel,
      transactions: [...filtered].sort((a, b) => b.borrowDate.localeCompare(a.borrowDate)),
      total,
      returned,
      active,
      overdueList,
      topCollections,
    };
  }, [transactions, reportPeriod, selectedDay, selectedMonth, collectionMap]);

  const activeBorrowedCountForEditing = useMemo(() => {
    if (!editingItem) return 0;
    return transactions.filter(
      (t) => t.collectionId === editingItem.id && t.status === 'active'
    ).length;
  }, [editingItem, transactions]);

  const activeBorrowedCountForDelete = useMemo(() => {
    if (!deleteTarget) return 0;
    return transactions.filter(
      (t) => t.collectionId === deleteTarget.id && t.status === 'active'
    ).length;
  }, [deleteTarget, transactions]);

  const handleSaveCollection = (values: CollectionFormValues) => {
    if (editingItem) {
      onUpdateCollection(editingItem.id, values);
    } else {
      onAddCollection(values);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  return (
    <main className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 lg:py-8">
      {/* Official Print-Only Report Letterhead */}
      <div className="hidden print:block border-b-2 border-[#0F172A] pb-4 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">
              PERPUSTAKAAN DIGITAL LIBRARYAN
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Sistem Informasi Perpustakaan Terintegrasi · Rekap Sirkulasi Resmi
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p>Periode: {reportData.periodLabel}</p>
            <p>Dicetak: {formatIndonesianDate(todayISO)}</p>
          </div>
        </div>
      </div>

      {/* Admin Header (Hidden on Print) */}
      <section className="no-print flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
            Dashboard Pustakawan
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
            {activeTab === 'overview'
              ? 'Monitoring Sirkulasi & Statistik Real-Time'
              : activeTab === 'collections'
                ? 'Manajemen Koleksi & Klasifikasi DDC'
                : 'Laporan Otomatis Perpustakaan'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {activeTab === 'overview'
              ? 'Pantau metrik peminjaman, tren grafik, dan verifikasi pengembalian koleksi secara langsung.'
              : activeTab === 'collections'
                ? 'Tambah, perbarui, atau hapus metadata bibliografi dan stok eksemplar katalog OPAC.'
                : 'Rekapitulasi otomatis sirkulasi harian/bulanan siap ekspor ke Excel (CSV) maupun cetak.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeTab === 'collections' && (
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Tambah Koleksi Baru</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Reset Data Simulasi</span>
          </button>
        </div>
      </section>

      {/* TAB 1: MONITORING & STATISTIK */}
      {activeTab === 'overview' && (
        <div className="mt-6 space-y-6">
          {/* 4 Main KPI Cards */}
          <section
            aria-label="Metrik Utama Perpustakaan"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Total Koleksi</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
                {metrics.totalTitles}
              </p>
              <p className="mt-1 text-xs text-slate-500 tabular-nums">
                {metrics.totalCopies} total eksemplar terdaftar
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Sedang Dipinjam</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#D97706] tabular-nums">
                {metrics.activeBorrowed}
              </p>
              <p className="mt-1 text-xs text-slate-500 tabular-nums">
                {metrics.overdueBorrowed > 0 ? (
                  <span className="font-semibold text-[#DC2626]">
                    {metrics.overdueBorrowed} transaksi terlambat
                  </span>
                ) : (
                  'Tidak ada pinjaman terlambat'
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Total Anggota Aktif</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
                {metrics.activeMembers}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Pemustaka terverifikasi aktif
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Transaksi Hari Ini</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#2563EB] tabular-nums">
                {metrics.todayTransactions}
              </p>
              <p className="mt-1 text-xs text-slate-500 tabular-nums">
                Per {formatIndonesianDate(todayISO)}
              </p>
            </div>
          </section>

          {/* Interactive Chart.js Visualizations */}
          <AdminCharts collections={collections} transactions={transactions} />

          {/* Real-Time Transaction Activity Log */}
          <section
            aria-label="Log Aktivitas Transaksi Real-Time"
            className="rounded-xl border border-slate-200 bg-white"
          >
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  Log Aktivitas Transaksi Real-Time
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sinkron otomatis dengan peminjaman dan pengembalian dari Portal Member
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={trxSearch}
                    onChange={(e) => setTrxSearch(e.target.value)}
                    placeholder="Cari anggota atau judul..."
                    aria-label="Cari log transaksi"
                    className="w-52 rounded-lg border border-slate-300 bg-[#F8FAFC] py-1.5 pl-8 pr-3 text-xs text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                  {(['ALL', 'Aktif', 'Terlambat', 'Selesai'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTrxStatusFilter(st)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                        trxStatusFilter === st
                          ? 'bg-white text-[#0F172A] shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-[#0F172A]'
                      }`}
                    >
                      {st === 'ALL' ? 'Semua' : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-slate-600">
                    <th className="px-4 py-3">ID & Tgl Pinjam</th>
                    <th className="px-4 py-3">Pemustaka</th>
                    <th className="px-4 py-3">Koleksi & No. Panggil</th>
                    <th className="px-4 py-3">Jatuh Tempo</th>
                    <th className="px-4 py-3">Tgl Kembali</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-xs text-slate-500">
                        Tidak ada transaksi yang cocok dengan filter saat ini.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((trx) => {
                      const col = collectionMap.get(trx.collectionId);
                      const mem = memberMap.get(trx.memberId);
                      const displayStatus = getTransactionDisplayStatus(trx);
                      const overdueDays = getOverdueDays(trx);

                      return (
                        <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="font-mono text-xs font-semibold text-[#0F172A]">
                              {trx.id}
                            </p>
                            <p className="text-xs text-slate-500 tabular-nums">
                              {formatIndonesianDate(trx.borrowDate)}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold text-[#0F172A]">
                              {mem?.name ?? 'Anggota'}
                            </p>
                            <p className="font-mono text-[11px] text-slate-500">
                              {mem?.memberCode ?? trx.memberId}
                            </p>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <p className="truncate text-xs font-semibold text-[#0F172A]">
                              {col?.title ?? 'Koleksi Dihapus'}
                            </p>
                            <p className="font-mono text-[11px] text-slate-500">
                              {col ? `${col.callNumber} · ${col.format}` : '—'}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-700 tabular-nums whitespace-nowrap">
                            {formatIndonesianDate(trx.dueDate)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                            {formatIndonesianDate(trx.returnDate)}
                          </td>
                          <td className="px-4 py-3">
                            <TransactionStatusTag
                              status={displayStatus}
                              overdueDays={overdueDays}
                            />
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {trx.status === 'active' ? (
                              <button
                                type="button"
                                onClick={() => onVerifyReturn(trx.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2563EB] transition-colors"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Verifikasi Pengembalian</span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">Terverifikasi</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: MANAJEMEN KOLEKSI (CRUD) */}
      {activeTab === 'collections' && (
        <div className="mt-6 space-y-5">
          {/* Search & DDC Filter */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={colSearch}
                onChange={(e) => setColSearch(e.target.value)}
                placeholder="Cari judul, pengarang, ISBN, atau nomor DDC..."
                aria-label="Cari koleksi di manajemen katalog"
                className="w-full rounded-lg border border-slate-300 bg-[#F8FAFC] py-2 pl-9 pr-3 text-sm text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                aria-label="Filter DDC di Manajemen Koleksi"
                value={colDDCFilter}
                onChange={(e) => setColDDCFilter(e.target.value as DDCCode | 'ALL')}
                className="rounded-lg border border-slate-300 bg-[#F8FAFC] px-3 py-2 text-xs font-medium text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
              >
                <option value="ALL">Semua Kelas DDC (000–900)</option>
                {DDC_CATEGORIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
                {filteredCollections.length} judul
              </span>
            </div>
          </div>

          {/* Collections CRUD Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-slate-600">
                  <th className="px-4 py-3">Klasifikasi DDC</th>
                  <th className="px-4 py-3">Judul & Pengarang</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3">ISBN / ISSN</th>
                  <th className="px-4 py-3">Ketersediaan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCollections.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-xs text-slate-500">
                      Tidak ada koleksi yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredCollections.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-mono text-xs font-semibold text-[#0F172A]">
                          {item.ddcNumber}
                        </p>
                        <p className="font-mono text-[11px] text-[#2563EB]">
                          {item.callNumber}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 max-w-md">
                        <p className="font-semibold text-[#0F172A]">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.author} · {item.publisher} ({item.year})
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                        {item.format}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {item.isbnIssn}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <AvailabilityTag
                          availableCopies={item.availableCopies}
                          totalCopies={item.totalCopies}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setIsFormOpen(true);
                            }}
                            aria-label={`Edit ${item.title}`}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            aria-label={`Hapus ${item.title}`}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-[#DC2626] hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SISTEM PELAPORAN OTOMATIS */}
      {activeTab === 'reports' && (
        <div className="mt-6 space-y-6">
          {/* Period Filter & Export Actions */}
          <section className="no-print flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div
                role="group"
                aria-label="Periode Laporan"
                className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1"
              >
                <button
                  type="button"
                  onClick={() => setReportPeriod('daily')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    reportPeriod === 'daily'
                      ? 'bg-[#0F172A] text-white'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  Laporan Harian
                </button>
                <button
                  type="button"
                  onClick={() => setReportPeriod('monthly')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    reportPeriod === 'monthly'
                      ? 'bg-[#0F172A] text-white'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  Laporan Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setReportPeriod('all')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    reportPeriod === 'all'
                      ? 'bg-[#0F172A] text-white'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  Semua Periode
                </button>
              </div>

              {reportPeriod === 'daily' && (
                <input
                  type="date"
                  aria-label="Pilih tanggal laporan harian"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-[#F8FAFC] px-3 py-1.5 text-xs font-mono text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              )}

              {reportPeriod === 'monthly' && (
                <input
                  type="month"
                  aria-label="Pilih bulan laporan bulanan"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-[#F8FAFC] px-3 py-1.5 text-xs font-mono text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  exportCirculationReportCSV({
                    periodLabel: reportData.periodLabel,
                    transactions: reportData.transactions,
                    collections,
                    members,
                    topCollections: reportData.topCollections,
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Export Laporan ke CSV / Excel</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <Printer className="h-4 w-4" aria-hidden="true" />
                <span>Cetak Laporan (Print-Friendly View)</span>
              </button>
            </div>
          </section>

          {/* Circulation Summary Cards */}
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 print-break-inside-avoid">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Total Sirkulasi Periode</p>
              <p className="mt-1.5 text-2xl font-bold text-[#0F172A] tabular-nums">
                {reportData.total}
              </p>
              <p className="mt-1 text-[11px] text-slate-500 truncate">{reportData.periodLabel}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Pengembalian Selesai</p>
              <p className="mt-1.5 text-2xl font-bold text-[#16A34A] tabular-nums">
                {reportData.returned}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">Sudah kembali ke rak/sistem</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Sedang Dipinjam</p>
              <p className="mt-1.5 text-2xl font-bold text-[#D97706] tabular-nums">
                {reportData.active}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">Masih dalam masa pinjam</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Status Terlambat</p>
              <p className="mt-1.5 text-2xl font-bold text-[#DC2626] tabular-nums">
                {reportData.overdueList.length}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">Perlu tindak lanjut pengembalian</p>
            </div>
          </section>

          {/* Two-column Automated Report Tables */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 print-break-inside-avoid">
            {/* Most Frequently Borrowed Collections */}
            <section className="rounded-xl border border-slate-200 bg-white lg:col-span-6">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-sm font-bold text-[#0F172A]">
                  Koleksi Paling Sering Dipinjam
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Peringkat popularitas peminjaman pada {reportData.periodLabel}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] font-semibold text-slate-600">
                      <th className="px-4 py-2.5">#</th>
                      <th className="px-4 py-2.5">Judul & DDC</th>
                      <th className="px-4 py-2.5">Format</th>
                      <th className="px-4 py-2.5 text-right">Dipinjam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.topCollections.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          Belum ada aktivitas peminjaman pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      reportData.topCollections.map((entry, idx) => (
                        <tr key={entry.item.id}>
                          <td className="px-4 py-2.5 font-mono font-semibold text-slate-500 tabular-nums">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-2.5">
                            <p className="font-semibold text-[#0F172A]">{entry.item.title}</p>
                            <p className="font-mono text-[11px] text-slate-500">
                              DDC {entry.item.ddcNumber} · {entry.item.callNumber}
                            </p>
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                            {entry.item.format}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold text-[#2563EB] tabular-nums">
                            {entry.borrowCount}x
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Overdue & Follow-up Status */}
            <section className="rounded-xl border border-slate-200 bg-white lg:col-span-6">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-sm font-bold text-[#0F172A]">
                  Rekap Keterlambatan Pengembalian
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftar pemustaka yang melewati tanggal jatuh tempo
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] font-semibold text-slate-600">
                      <th className="px-4 py-2.5">Pemustaka</th>
                      <th className="px-4 py-2.5">Koleksi</th>
                      <th className="px-4 py-2.5">Jatuh Tempo</th>
                      <th className="px-4 py-2.5 text-right">Keterlambatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData.overdueList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-[#16A34A] font-medium">
                          Tidak ada keterlambatan pengembalian pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      reportData.overdueList.map((trx) => {
                        const mem = memberMap.get(trx.memberId);
                        const col = collectionMap.get(trx.collectionId);
                        const overdueDays = getOverdueDays(trx);
                        return (
                          <tr key={trx.id}>
                            <td className="px-4 py-2.5">
                              <p className="font-semibold text-[#0F172A]">
                                {mem?.name ?? trx.memberId}
                              </p>
                              <p className="font-mono text-[11px] text-slate-500">
                                {mem?.memberCode}
                              </p>
                            </td>
                            <td className="px-4 py-2.5">
                              <p className="font-medium text-[#0F172A]">
                                {col?.title ?? trx.collectionId}
                              </p>
                            </td>
                            <td className="px-4 py-2.5 tabular-nums text-slate-600 whitespace-nowrap">
                              {formatIndonesianDate(trx.dueDate)}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-[#DC2626] tabular-nums whitespace-nowrap">
                              {overdueDays} hari
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Complete Period Transaction Recap Table */}
          <section className="rounded-xl border border-slate-200 bg-white print-break-inside-avoid">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-bold text-[#0F172A]">
                Rincian Transaksi Sirkulasi ({reportData.periodLabel})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[740px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] font-semibold text-slate-600">
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Pemustaka</th>
                    <th className="px-4 py-2.5">Judul Koleksi</th>
                    <th className="px-4 py-2.5">Tgl Pinjam</th>
                    <th className="px-4 py-2.5">Jatuh Tempo</th>
                    <th className="px-4 py-2.5">Tgl Kembali</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        Tidak ada catatan sirkulasi pada periode yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    reportData.transactions.map((trx) => {
                      const mem = memberMap.get(trx.memberId);
                      const col = collectionMap.get(trx.collectionId);
                      const status = getTransactionDisplayStatus(trx);
                      const overdueDays = getOverdueDays(trx);
                      return (
                        <tr key={trx.id}>
                          <td className="px-4 py-2.5 font-mono text-slate-600 whitespace-nowrap">
                            {trx.id}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-[#0F172A]">
                            {mem?.name ?? trx.memberId}
                          </td>
                          <td className="px-4 py-2.5 text-slate-700">
                            {col?.title ?? trx.collectionId}
                          </td>
                          <td className="px-4 py-2.5 tabular-nums whitespace-nowrap">
                            {formatIndonesianDate(trx.borrowDate)}
                          </td>
                          <td className="px-4 py-2.5 tabular-nums whitespace-nowrap">
                            {formatIndonesianDate(trx.dueDate)}
                          </td>
                          <td className="px-4 py-2.5 tabular-nums whitespace-nowrap">
                            {formatIndonesianDate(trx.returnDate)}
                          </td>
                          <td className="px-4 py-2.5">
                            <TransactionStatusTag status={status} overdueDays={overdueDays} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Print-Only Signature Block */}
          <div className="hidden print:flex justify-end pt-8">
            <div className="text-center text-xs text-slate-700 w-56">
              <p>Mengetahui,</p>
              <p className="font-semibold text-[#0F172A]">Kepala Pustakawan LibraRyan</p>
              <div className="h-16" />
              <p className="border-t border-slate-400 pt-1 font-medium">
                NIP. 19880412 201503 1 002
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Collection Modal */}
      <CollectionFormModal
        isOpen={isFormOpen}
        editingItem={editingItem}
        activeBorrowedCountForItem={activeBorrowedCountForEditing}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveCollection}
      />

      {/* Delete Confirmation Modal (No window.confirm) */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[#0F172A]">Hapus Koleksi Katalog?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Anda akan menghapus <strong className="text-[#0F172A]">{deleteTarget.title}</strong>{' '}
              (DDC {deleteTarget.ddcNumber}).
            </p>
            {activeBorrowedCountForDelete > 0 && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-[#DC2626]">
                Koleksi ini memiliki {activeBorrowedCountForDelete} eksemplar yang sedang dipinjam.
                Selesaikan pengembalian terlebih dahulu sebelum menghapus.
              </div>
            )}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={activeBorrowedCountForDelete > 0}
                onClick={() => {
                  onDeleteCollection(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors ${
                  activeBorrowedCountForDelete > 0
                    ? 'cursor-not-allowed bg-slate-300'
                    : 'bg-[#DC2626] hover:bg-red-700'
                }`}
              >
                Ya, Hapus Koleksi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Simulation Data Confirmation Modal */}
      {confirmResetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmResetOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[#0F172A]">
              Kembalikan Data Awal Simulasi?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Seluruh perubahan lokal akan direset kembali ke 10 koleksi DDC awal, 3 anggota, dan 5
              riwayat transaksi awal.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetSeedData();
                  setConfirmResetOpen(false);
                }}
                className="rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
