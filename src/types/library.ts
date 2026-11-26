export type UserRole = 'member' | 'admin';

export type MemberTab = 'opac' | 'dashboard';
export type AdminTab = 'overview' | 'collections' | 'reports';

export type CollectionFormat =
  | 'E-Book'
  | 'Buku Referensi'
  | 'Jurnal'
  | 'Cerita Rakyat'
  | 'Audiobook';

export type DDCCode =
  | '000'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export interface DDCCategory {
  code: DDCCode;
  label: string;
  shortLabel: string;
}

export interface CollectionItem {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  isbnIssn: string;
  ddcNumber: string;
  ddcCategory: DDCCode;
  callNumber: string;
  format: CollectionFormat;
  subject: string;
  totalCopies: number;
  availableCopies: number;
  synopsis: string;
  shelfLocation: string;
  sampleExcerpt: string;
  durationOrPages: string;
  createdAt: string;
}

export interface Member {
  id: string;
  memberCode: string;
  name: string;
  category: string;
  email: string;
  joinedAt: string;
  status: 'Aktif' | 'Nonaktif';
}

export type TransactionRawStatus = 'active' | 'returned';
export type TransactionDisplayStatus = 'Aktif' | 'Selesai' | 'Terlambat';

export interface Transaction {
  id: string;
  memberId: string;
  collectionId: string;
  borrowDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  returnDate: string | null; // YYYY-MM-DD
  status: TransactionRawStatus;
}

export interface LibraryState {
  collections: CollectionItem[];
  members: Member[];
  transactions: Transaction[];
  activeRole: UserRole;
  activeMemberId: string;
}

export type ReportPeriod = 'daily' | 'monthly' | 'all';
