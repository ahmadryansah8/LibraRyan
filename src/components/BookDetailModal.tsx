import { BookOpen, Calendar, CheckCircle2, X } from 'lucide-react';
import { CollectionItem, Member } from '../types/library';
import { addDaysISO, formatIndonesianDate, getDDCLabel, getTodayISO } from '../utils/libraryHelpers';
import { AvailabilityTag } from './StatusBadge';

interface BookDetailModalProps {
  item: CollectionItem | null;
  activeMember: Member;
  isAlreadyBorrowedByMember: boolean;
  onClose: () => void;
  onBorrow: (collectionId: string) => void;
  onOpenReader: (item: CollectionItem) => void;
}

export function BookDetailModal({
  item,
  activeMember,
  isAlreadyBorrowedByMember,
  onClose,
  onBorrow,
  onOpenReader,
}: BookDetailModalProps) {
  if (!item) return null;

  const todayISO = getTodayISO();
  const projectedDueDate = addDaysISO(todayISO, 7);
  const canBorrow = item.availableCopies > 0 && !isAlreadyBorrowedByMember;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-book-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
              <span>DDC {item.ddcNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{item.callNumber}</span>
              <span aria-hidden="true">·</span>
              <span className="font-sans font-medium text-[#2563EB]">{item.format}</span>
            </div>
            <h2
              id="modal-book-title"
              className="mt-1 text-xl font-bold tracking-tight text-[#0F172A] leading-snug"
            >
              {item.title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-600">{item.author}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail bibliografi"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#0F172A] transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 px-6 py-5">
          {/* Status & Availability Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-[#F8FAFC] px-4 py-3">
            <div className="flex items-center gap-3">
              <AvailabilityTag
                availableCopies={item.availableCopies}
                totalCopies={item.totalCopies}
              />
              <span className="text-xs text-slate-500">
                Lokasi: <span className="font-medium text-slate-700">{item.shelfLocation}</span>
              </span>
            </div>
            <span className="text-xs text-slate-500">{item.durationOrPages}</span>
          </div>

          {/* Bibliographic Metadata Table */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Metadata Bibliografi Lengkap
            </h3>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 border-t border-b border-slate-200 py-4 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Pengarang</dt>
                <dd className="mt-0.5 font-medium text-[#0F172A]">{item.author}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Penerbit & Tahun</dt>
                <dd className="mt-0.5 font-medium text-[#0F172A]">
                  {item.publisher}, {item.year}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">ISBN / ISSN</dt>
                <dd className="mt-0.5 font-mono text-xs font-medium text-[#0F172A]">
                  {item.isbnIssn}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Klasifikasi DDC</dt>
                <dd className="mt-0.5 text-sm font-medium text-[#0F172A]">
                  <span className="font-mono">{item.ddcNumber}</span> — {getDDCLabel(item.ddcCategory)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Nomor Panggil</dt>
                <dd className="mt-0.5 font-mono text-xs font-semibold text-[#2563EB]">
                  {item.callNumber}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Subjek</dt>
                <dd className="mt-0.5 font-medium text-[#0F172A]">{item.subject}</dd>
              </div>
            </dl>
          </div>

          {/* Synopsis */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Sinopsis Koleksi
            </h3>
            <p className="text-sm leading-relaxed text-slate-700">{item.synopsis}</p>
          </div>

          {/* Circulation Loan Preview */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                <span>
                  Peminjam: <strong className="text-[#0F172A]">{activeMember.name}</strong> ({activeMember.memberCode})
                </span>
              </div>
              <span className="tabular-nums">
                Jatuh tempo 7 hari: <strong className="text-[#0F172A]">{formatIndonesianDate(projectedDueDate)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenReader(item)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-slate-50 transition-colors"
          >
            <BookOpen className="h-4 w-4 text-slate-600" aria-hidden="true" />
            <span>Pratinjau / Akses</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>

            {isAlreadyBorrowedByMember ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-[#16A34A]">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>Sedang Anda Pinjam</span>
              </span>
            ) : (
              <button
                type="button"
                disabled={!canBorrow}
                onClick={() => onBorrow(item.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
                  canBorrow
                    ? 'bg-[#2563EB] text-white hover:bg-blue-700'
                    : 'cursor-not-allowed bg-slate-200 text-slate-500'
                }`}
              >
                <span>
                  {item.availableCopies > 0
                    ? 'Pinjam Buku Sekarang'
                    : 'Stok Sedang Dipinjam'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
