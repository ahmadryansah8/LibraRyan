import { createInitialSeedState, DDC_CATEGORIES } from '../data/seedData';
import {
  CollectionItem,
  DDCCode,
  LibraryState,
  Member,
  Transaction,
  TransactionDisplayStatus,
} from '../types/library';

export const STORAGE_KEY = 'libraryan_integrated_state_v1';

export function getTodayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDaysISO(baseISO: string, days: number): string {
  const [y, m, d] = baseISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12, 0, 0);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function diffDaysISO(fromISO: string, toISO: string): number {
  const [y1, m1, d1] = fromISO.split('-').map(Number);
  const [y2, m2, d2] = toISO.split('-').map(Number);
  const t1 = Date.UTC(y1, m1 - 1, d1);
  const t2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
}

export function formatIndonesianDate(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getTransactionDisplayStatus(trx: Transaction): TransactionDisplayStatus {
  if (trx.status === 'returned') {
    return 'Selesai';
  }
  const today = getTodayISO();
  if (trx.dueDate < today) {
    return 'Terlambat';
  }
  return 'Aktif';
}

export function getOverdueDays(trx: Transaction): number {
  if (trx.status === 'returned') {
    if (!trx.returnDate) return 0;
    const diff = diffDaysISO(trx.dueDate, trx.returnDate);
    return diff > 0 ? diff : 0;
  }
  const today = getTodayISO();
  const diff = diffDaysISO(trx.dueDate, today);
  return diff > 0 ? diff : 0;
}

export function inferDDCClassFromNumber(ddcNumber: string): DDCCode {
  const trimmed = ddcNumber.trim();
  const firstChar = trimmed.charAt(0);
  if (firstChar >= '0' && firstChar <= '9') {
    return `${firstChar}00` as DDCCode;
  }
  return '000';
}

export function getDDCLabel(code: DDCCode): string {
  return DDC_CATEGORIES.find((c) => c.code === code)?.label ?? `${code}`;
}

export function getDDCShortLabel(code: DDCCode): string {
  return DDC_CATEGORIES.find((c) => c.code === code)?.shortLabel ?? code;
}

export function loadLibraryState(): LibraryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createInitialSeedState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as LibraryState;
    if (
      !parsed ||
      !Array.isArray(parsed.collections) ||
      !Array.isArray(parsed.members) ||
      !Array.isArray(parsed.transactions)
    ) {
      const seed = createInitialSeedState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    const seed = createInitialSeedState();
    return seed;
  }
}

export function saveLibraryState(state: LibraryState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors safely
  }
}

export function resetLibraryState(): LibraryState {
  const seed = createInitialSeedState();
  saveLibraryState(seed);
  return seed;
}

function escapeCSVCell(value: string | number): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportCirculationReportCSV(options: {
  periodLabel: string;
  transactions: Transaction[];
  collections: CollectionItem[];
  members: Member[];
  topCollections: Array<{ item: CollectionItem; borrowCount: number }>;
}): void {
  const { periodLabel, transactions, collections, members, topCollections } = options;

  const colMap = new Map(collections.map((c) => [c.id, c]));
  const memMap = new Map(members.map((m) => [m.id, m]));

  const totalBorrowed = transactions.length;
  const totalReturned = transactions.filter((t) => getTransactionDisplayStatus(t) === 'Selesai').length;
  const totalActive = transactions.filter((t) => getTransactionDisplayStatus(t) === 'Aktif').length;
  const totalOverdue = transactions.filter((t) => getTransactionDisplayStatus(t) === 'Terlambat').length;

  const lines: string[] = [];
  lines.push(['LAPORAN SIRKULASI PERPUSTAKAAN DIGITAL LIBRARYAN'].map(escapeCSVCell).join(','));
  lines.push(['Periode Laporan', periodLabel].map(escapeCSVCell).join(','));
  lines.push(['Tanggal Cetak', formatIndonesianDate(getTodayISO())].map(escapeCSVCell).join(','));
  lines.push('');

  lines.push(['RINGKASAN SIRKULASI'].map(escapeCSVCell).join(','));
  lines.push(['Total Transaksi', totalBorrowed].map(escapeCSVCell).join(','));
  lines.push(['Pengembalian Selesai', totalReturned].map(escapeCSVCell).join(','));
  lines.push(['Sedang Dipinjam (Aktif)', totalActive].map(escapeCSVCell).join(','));
  lines.push(['Terlambat Mengembalikan', totalOverdue].map(escapeCSVCell).join(','));
  lines.push('');

  lines.push(['KOLEKSI PALING SERING DIPINJAM'].map(escapeCSVCell).join(','));
  lines.push(['Peringkat', 'Judul Koleksi', 'Pengarang', 'Nomor DDC', 'Nomor Panggil', 'Jumlah Peminjaman'].map(escapeCSVCell).join(','));
  topCollections.forEach((entry, index) => {
    lines.push(
      [
        index + 1,
        entry.item.title,
        entry.item.author,
        entry.item.ddcNumber,
        entry.item.callNumber,
        entry.borrowCount,
      ]
        .map(escapeCSVCell)
        .join(',')
    );
  });
  lines.push('');

  lines.push(['RINCIAN LOG TRANSAKSI'].map(escapeCSVCell).join(','));
  lines.push(
    [
      'ID Transaksi',
      'Kode Anggota',
      'Nama Pemustaka',
      'Judul Koleksi',
      'Nomor DDC',
      'Nomor Panggil',
      'Tanggal Pinjam',
      'Jatuh Tempo',
      'Tanggal Kembali',
      'Status',
      'Keterlambatan (Hari)',
    ]
      .map(escapeCSVCell)
      .join(',')
  );

  transactions.forEach((trx) => {
    const col = colMap.get(trx.collectionId);
    const mem = memMap.get(trx.memberId);
    const status = getTransactionDisplayStatus(trx);
    const overdueDays = getOverdueDays(trx);

    lines.push(
      [
        trx.id,
        mem?.memberCode ?? trx.memberId,
        mem?.name ?? 'Anggota Dihapus',
        col?.title ?? 'Koleksi Dihapus',
        col?.ddcNumber ?? '-',
        col?.callNumber ?? '-',
        trx.borrowDate,
        trx.dueDate,
        trx.returnDate ?? '-',
        status,
        overdueDays,
      ]
        .map(escapeCSVCell)
        .join(',')
    );
  });

  // Add UTF-8 BOM so Microsoft Excel reads Indonesian characters cleanly
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeSlug = periodLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.href = url;
  link.setAttribute('download', `laporan-libraryan-${safeSlug}-${getTodayISO()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
