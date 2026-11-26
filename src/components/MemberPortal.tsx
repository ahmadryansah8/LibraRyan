import { BookOpen, Filter, RotateCcw, Search, UserCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { COLLECTION_FORMATS, DDC_CATEGORIES, getDDCColor } from '../data/seedData';
import {
  CollectionFormat,
  CollectionItem,
  DDCCode,
  Member,
  MemberTab,
  Transaction,
} from '../types/library';
import {
  diffDaysISO,
  formatIndonesianDate,
  getOverdueDays,
  getTodayISO,
  getTransactionDisplayStatus,
} from '../utils/libraryHelpers';
import { AvailabilityTag, TransactionStatusTag } from './StatusBadge';

interface MemberPortalProps {
  activeTab: MemberTab;
  onTabChange: (tab: MemberTab) => void;
  collections: CollectionItem[];
  members: Member[];
  activeMember: Member;
  onSelectMember: (memberId: string) => void;
  transactions: Transaction[];
  onSelectCollection: (item: CollectionItem) => void;
  onReturnLoan: (transactionId: string) => void;
  onOpenReader: (item: CollectionItem) => void;
}

export function MemberPortal({
  activeTab,
  onTabChange,
  collections,
  members,
  activeMember,
  onSelectMember,
  transactions,
  onSelectCollection,
  onReturnLoan,
  onOpenReader,
}: MemberPortalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDDC, setSelectedDDC] = useState<DDCCode | 'ALL'>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<CollectionFormat | 'ALL'>('ALL');

  const collectionMap = useMemo(
    () => new Map(collections.map((c) => [c.id, c])),
    [collections]
  );

  // Member-specific transactions
  const memberTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.memberId === activeMember.id)
      .sort((a, b) => b.borrowDate.localeCompare(a.borrowDate));
  }, [transactions, activeMember.id]);

  const activeLoans = useMemo(
    () => memberTransactions.filter((t) => t.status === 'active'),
    [memberTransactions]
  );

  const overdueCount = useMemo(
    () => activeLoans.filter((t) => getTransactionDisplayStatus(t) === 'Terlambat').length,
    [activeLoans]
  );

  const completedCount = useMemo(
    () => memberTransactions.filter((t) => t.status === 'returned').length,
    [memberTransactions]
  );

  // Filtered OPAC catalog
  const filteredCollections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return collections.filter((item) => {
      if (selectedDDC !== 'ALL' && item.ddcCategory !== selectedDDC) return false;
      if (selectedFormat !== 'ALL' && item.format !== selectedFormat) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.ddcNumber.toLowerCase().includes(q) ||
        item.callNumber.toLowerCase().includes(q) ||
        item.isbnIssn.toLowerCase().includes(q)
      );
    });
  }, [collections, searchQuery, selectedDDC, selectedFormat]);

  const activeLoanCollectionIds = useMemo(
    () => new Set(activeLoans.map((t) => t.collectionId)),
    [activeLoans]
  );

  const hasActiveFilter =
    searchQuery.trim() !== '' || selectedDDC !== 'ALL' || selectedFormat !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDDC('ALL');
    setSelectedFormat('ALL');
  };

  return (
    <main className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 lg:py-8">
      {/* Workspace Header & Active Member Selector */}
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
            Portal Pemustaka
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
            {activeTab === 'opac'
              ? 'Katalog Publik Online (OPAC)'
              : 'Dashboard Aktivitas Pemustaka'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {activeTab === 'opac'
              ? 'Telusuri koleksi buku, jurnal, cerita rakyat, dan materi digital berdasarkan klasifikasi DDC 000–900.'
              : 'Pantau status pinjaman aktif, jadwal jatuh tempo, akses koleksi digital, dan riwayat sirkulasi Anda.'}
          </p>
        </div>

        {/* Active Member Switcher + Quick Tab Jump */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <UserCheck className="h-4 w-4 text-[#2563EB] shrink-0" aria-hidden="true" />
            <label htmlFor="member-selector" className="text-xs font-medium text-slate-500">
              Pemustaka:
            </label>
            <select
              id="member-selector"
              value={activeMember.id}
              onChange={(e) => onSelectMember(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#0F172A] focus:outline-none"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.memberCode})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => onTabChange(activeTab === 'opac' ? 'dashboard' : 'opac')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <span>
              {activeTab === 'opac'
                ? `Pinjaman Saya (${activeLoans.length})`
                : 'Buka Katalog OPAC'}
            </span>
          </button>
        </div>
      </section>

      {activeTab === 'opac' ? (
        <div className="mt-6 space-y-6">
          {/* OPAC Search & Filter Bar */}
          <section
            aria-label="Pencarian dan Filter OPAC"
            className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              {/* Search Input */}
              <div className="relative lg:col-span-6">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul, pengarang, subjek, atau nomor DDC (mis. 005.133)..."
                  aria-label="Cari koleksi di katalog OPAC"
                  className="w-full rounded-lg border border-slate-300 bg-[#F8FAFC] py-2.5 pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>

              {/* DDC Filter */}
              <div className="lg:col-span-3">
                <div className="relative">
                  <Filter
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <select
                    aria-label="Filter berdasarkan Kategori DDC"
                    value={selectedDDC}
                    onChange={(e) => setSelectedDDC(e.target.value as DDCCode | 'ALL')}
                    className="w-full rounded-lg border border-slate-300 bg-[#F8FAFC] py-2.5 pl-9 pr-3 text-sm text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    <option value="ALL">Semua Kategori DDC (000–900)</option>
                    {DDC_CATEGORIES.map((ddc) => (
                      <option key={ddc.code} value={ddc.code}>
                        {ddc.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Format Filter */}
              <div className="lg:col-span-3">
                <select
                  aria-label="Filter berdasarkan Format Koleksi"
                  value={selectedFormat}
                  onChange={(e) =>
                    setSelectedFormat(e.target.value as CollectionFormat | 'ALL')
                  }
                  className="w-full rounded-lg border border-slate-300 bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  <option value="ALL">Semua Format Koleksi</option>
                  {COLLECTION_FORMATS.map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Format Segmented Quick Filter + Results Counter */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedFormat('ALL')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    selectedFormat === 'ALL'
                      ? 'bg-[#0F172A] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#0F172A]'
                  }`}
                >
                  Semua
                </button>
                {COLLECTION_FORMATS.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setSelectedFormat(fmt)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      selectedFormat === fmt
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#0F172A]'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="tabular-nums">
                  Menampilkan <strong className="text-[#0F172A]">{filteredCollections.length}</strong>{' '}
                  dari {collections.length} koleksi
                </span>
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:underline"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Reset Filter</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Catalog Grid */}
          {filteredCollections.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center">
              <p className="text-base font-semibold text-[#0F172A]">
                Tidak ada koleksi yang sesuai dengan pencarian Anda
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Coba ubah kata kunci pencarian, kelas klasifikasi DDC, atau format koleksi.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Tampilkan Semua Koleksi
              </button>
            </div>
          ) : (
            <section
              aria-label="Daftar Katalog Koleksi"
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredCollections.map((item) => {
                const isBorrowedByMe = activeLoanCollectionIds.has(item.id);
                const ddcAccent = getDDCColor(item.ddcCategory);

                return (
                  <article
                    key={item.id}
                    className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-[#2563EB]/60"
                  >
                    <div>
                      {/* Clean Typographic Metadata Header (Zero-Pill) */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 font-mono text-slate-600 min-w-0 truncate">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-xs shrink-0"
                            style={{ backgroundColor: ddcAccent }}
                            aria-hidden="true"
                          />
                          <span className="font-semibold text-[#0F172A]">
                            DDC {item.ddcNumber}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{item.callNumber}</span>
                        </div>
                        <span className="font-medium text-[#2563EB] whitespace-nowrap shrink-0">
                          {item.format}
                        </span>
                      </div>

                      {/* Title & Author */}
                      <h2 className="mt-3 text-base font-bold leading-snug text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                        <button
                          type="button"
                          onClick={() => onSelectCollection(item)}
                          className="text-left focus-visible:outline-none focus-visible:underline"
                        >
                          {item.title}
                        </button>
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.author} <span aria-hidden="true">·</span> {item.year}
                      </p>

                      {/* Subject & Excerpt */}
                      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {item.synopsis}
                      </p>
                      <p className="mt-2 truncate text-xs text-slate-500">
                        Subjek: <span className="text-slate-700">{item.subject}</span>
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
                      <AvailabilityTag
                        availableCopies={item.availableCopies}
                        totalCopies={item.totalCopies}
                      />

                      <div className="flex items-center gap-2">
                        {isBorrowedByMe && (
                          <span className="text-xs font-semibold text-[#2563EB]">
                            Dipinjam Anda
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onSelectCollection(item)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors whitespace-nowrap shrink-0"
                        >
                          Detail & Pinjam
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      ) : (
        /* Member Personal Dashboard */
        <div className="mt-6 space-y-8">
          {/* Member Summary Strip */}
          <section
            aria-label="Ringkasan Aktivitas Pemustaka"
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Sedang Dipinjam</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
                {activeLoans.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Koleksi aktif atas nama {activeMember.name}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Status Jatuh Tempo</p>
              <p
                className={`mt-2 text-3xl font-bold tracking-tight tabular-nums ${
                  overdueCount > 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'
                }`}
              >
                {overdueCount}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {overdueCount > 0
                  ? 'Segera kembalikan koleksi melewati batas waktu'
                  : 'Seluruh pinjaman masih dalam batas waktu'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Total Riwayat Selesai</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] tabular-nums">
                {completedCount}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Koleksi yang telah dikembalikan tepat/selesai
              </p>
            </div>
          </section>

          {/* Active Borrowings */}
          <section aria-label="Daftar Pinjaman Aktif">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-[#0F172A]">
                Koleksi Sedang Dipinjam ({activeLoans.length})
              </h2>
              <button
                type="button"
                onClick={() => onTabChange('opac')}
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                + Pinjam Koleksi Lainnya
              </button>
            </div>

            {activeLoans.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center">
                <p className="text-sm font-semibold text-[#0F172A]">
                  Belum ada koleksi yang sedang dipinjam
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Jelajahi katalog OPAC untuk meminjam buku referensi, e-book, jurnal, atau audiobook.
                </p>
                <button
                  type="button"
                  onClick={() => onTabChange('opac')}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Telusuri Katalog OPAC
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeLoans.map((trx) => {
                  const col = collectionMap.get(trx.collectionId);
                  if (!col) return null;
                  const status = getTransactionDisplayStatus(trx);
                  const overdueDays = getOverdueDays(trx);
                  const daysLeft = diffDaysISO(getTodayISO(), trx.dueDate);

                  return (
                    <div
                      key={trx.id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono text-slate-500">{trx.id}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono font-medium text-slate-700">
                            {col.callNumber}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-[#2563EB]">{col.format}</span>
                        </div>
                        <h3 className="text-base font-bold text-[#0F172A]">
                          {col.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 tabular-nums">
                          <span>
                            Dipinjam: <strong className="text-[#0F172A]">{formatIndonesianDate(trx.borrowDate)}</strong>
                          </span>
                          <span>
                            Jatuh Tempo: <strong className="text-[#0F172A]">{formatIndonesianDate(trx.dueDate)}</strong>
                          </span>
                          <span
                            className={
                              status === 'Terlambat'
                                ? 'font-semibold text-[#DC2626]'
                                : 'text-slate-600'
                            }
                          >
                            {status === 'Terlambat'
                              ? `Lewat ${overdueDays} hari`
                              : daysLeft === 0
                                ? 'Jatuh tempo hari ini'
                                : `Sisa waktu ${daysLeft} hari`}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <TransactionStatusTag status={status} overdueDays={overdueDays} />
                        <button
                          type="button"
                          onClick={() => onOpenReader(col)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors whitespace-nowrap"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                          <span>Baca / Akses Koleksi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onReturnLoan(trx.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                        >
                          <span>Kembalikan Buku</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Borrowing History Table */}
          <section aria-label="Riwayat Peminjaman Pemustaka">
            <h2 className="mb-3 text-lg font-bold text-[#0F172A]">
              Riwayat Sirkulasi Lengkap ({memberTransactions.length})
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-slate-600">
                    <th className="px-4 py-3">ID Transaksi</th>
                    <th className="px-4 py-3">Judul Koleksi</th>
                    <th className="px-4 py-3">Tanggal Pinjam</th>
                    <th className="px-4 py-3">Jatuh Tempo</th>
                    <th className="px-4 py-3">Tanggal Kembali</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memberTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">
                        Belum ada riwayat transaksi untuk anggota ini.
                      </td>
                    </tr>
                  ) : (
                    memberTransactions.map((trx) => {
                      const col = collectionMap.get(trx.collectionId);
                      const status = getTransactionDisplayStatus(trx);
                      const overdueDays = getOverdueDays(trx);

                      return (
                        <tr key={trx.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                            {trx.id}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-[#0F172A]">
                              {col?.title ?? 'Koleksi tidak ditemukan'}
                            </p>
                            <p className="font-mono text-xs text-slate-500">
                              {col?.callNumber ?? '—'}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                            {formatIndonesianDate(trx.borrowDate)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                            {formatIndonesianDate(trx.dueDate)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                            {formatIndonesianDate(trx.returnDate)}
                          </td>
                          <td className="px-4 py-3">
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
        </div>
      )}
    </main>
  );
}
