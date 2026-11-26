import { X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { COLLECTION_FORMATS, DDC_CATEGORIES } from '../data/seedData';
import { CollectionFormat, CollectionItem, DDCCode } from '../types/library';
import { inferDDCClassFromNumber } from '../utils/libraryHelpers';

export interface CollectionFormValues {
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
  shelfLocation: string;
  durationOrPages: string;
  synopsis: string;
}

interface CollectionFormModalProps {
  isOpen: boolean;
  editingItem: CollectionItem | null;
  activeBorrowedCountForItem: number;
  onClose: () => void;
  onSave: (values: CollectionFormValues) => void;
}

export function CollectionFormModal({
  isOpen,
  editingItem,
  activeBorrowedCountForItem,
  onClose,
  onSave,
}: CollectionFormModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState(2025);
  const [isbnIssn, setIsbnIssn] = useState('');
  const [ddcNumber, setDdcNumber] = useState('005.1');
  const [ddcCategory, setDdcCategory] = useState<DDCCode>('000');
  const [callNumber, setCallNumber] = useState('');
  const [format, setFormat] = useState<CollectionFormat>('E-Book');
  const [subject, setSubject] = useState('');
  const [totalCopies, setTotalCopies] = useState(3);
  const [shelfLocation, setShelfLocation] = useState('');
  const [durationOrPages, setDurationOrPages] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    if (editingItem) {
      setTitle(editingItem.title);
      setAuthor(editingItem.author);
      setPublisher(editingItem.publisher);
      setYear(editingItem.year);
      setIsbnIssn(editingItem.isbnIssn);
      setDdcNumber(editingItem.ddcNumber);
      setDdcCategory(editingItem.ddcCategory);
      setCallNumber(editingItem.callNumber);
      setFormat(editingItem.format);
      setSubject(editingItem.subject);
      setTotalCopies(editingItem.totalCopies);
      setShelfLocation(editingItem.shelfLocation);
      setDurationOrPages(editingItem.durationOrPages);
      setSynopsis(editingItem.synopsis);
    } else {
      setTitle('');
      setAuthor('');
      setPublisher('');
      setYear(new Date().getFullYear());
      setIsbnIssn('');
      setDdcNumber('005.1');
      setDdcCategory('000');
      setCallNumber('');
      setFormat('E-Book');
      setSubject('');
      setTotalCopies(3);
      setShelfLocation('Repositori Digital · Koleksi Baru');
      setDurationOrPages('250 halaman');
      setSynopsis('');
    }
  }, [isOpen, editingItem]);

  if (!isOpen) return null;

  const handleDDCNumberChange = (val: string) => {
    setDdcNumber(val);
    const inferred = inferDDCClassFromNumber(val);
    setDdcCategory(inferred);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !ddcNumber.trim() || !callNumber.trim()) {
      setErrorMsg('Mohon lengkapi Judul, Pengarang, Nomor DDC, dan Nomor Panggil.');
      return;
    }
    if (totalCopies < activeBorrowedCountForItem) {
      setErrorMsg(
        `Jumlah eksemplar tidak boleh kurang dari ${activeBorrowedCountForItem} karena sedang dipinjam.`
      );
      return;
    }

    onSave({
      title: title.trim(),
      author: author.trim(),
      publisher: publisher.trim() || 'Penerbit Mandiri',
      year: Number(year) || new Date().getFullYear(),
      isbnIssn: isbnIssn.trim() || '978-602-0000-00-0',
      ddcNumber: ddcNumber.trim(),
      ddcCategory,
      callNumber: callNumber.trim(),
      format,
      subject: subject.trim() || 'Umum',
      totalCopies: Math.max(1, Number(totalCopies) || 1),
      shelfLocation: shelfLocation.trim() || 'Lantai 1 · Rak Koleksi Baru',
      durationOrPages: durationOrPages.trim() || '200 halaman',
      synopsis: synopsis.trim() || 'Ringkasan koleksi belum ditambahkan.',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="collection-form-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 id="collection-form-title" className="text-lg font-bold text-[#0F172A]">
              {editingItem ? 'Edit Data Koleksi' : 'Tambah Koleksi Baru'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Perubahan akan langsung tersinkronisasi ke Katalog OPAC Pemustaka.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form koleksi"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#0F172A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {errorMsg && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-[#DC2626]"
            >
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Koleksi *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pengantar Sistem Informasi Perpustakaan"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pengarang *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Nama pengarang utama"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Penerbit
              </label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="Nama penerbit"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Terbit
              </label>
              <input
                type="number"
                min={1900}
                max={2099}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ISBN / ISSN
              </label>
              <input
                type="text"
                value={isbnIssn}
                onChange={(e) => setIsbnIssn(e.target.value)}
                placeholder="978-623-xxxx-xx-x"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Klasifikasi DDC *
              </label>
              <input
                type="text"
                required
                value={ddcNumber}
                onChange={(e) => handleDDCNumberChange(e.target.value)}
                placeholder="Mis. 005.133 atau 899.221"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas Utama DDC
              </label>
              <select
                value={ddcCategory}
                onChange={(e) => setDdcCategory(e.target.value as DDCCode)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              >
                {DDC_CATEGORIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Panggil *
              </label>
              <input
                type="text"
                required
                value={callNumber}
                onChange={(e) => setCallNumber(e.target.value)}
                placeholder="Mis. 005.133 MUN a"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Format Koleksi
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as CollectionFormat)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              >
                {COLLECTION_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Eksemplar Total
              </label>
              <input
                type="number"
                min={Math.max(1, activeBorrowedCountForItem)}
                max={999}
                value={totalCopies}
                onChange={(e) => setTotalCopies(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
              {editingItem && activeBorrowedCountForItem > 0 && (
                <p className="mt-1 text-[11px] text-slate-500">
                  Sedang dipinjam: {activeBorrowedCountForItem} eksemplar
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subjek / Kata Kunci
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Mis. Ilmu Komputer, Basis Data"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lokasi Rak / Repositori
              </label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="Lantai 1 · Rak R-101"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Halaman / Durasi
              </label>
              <input
                type="text"
                value={durationOrPages}
                onChange={(e) => setDurationOrPages(e.target.value)}
                placeholder="320 halaman · PDF"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sinopsis
              </label>
              <textarea
                rows={3}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Deskripsi ringkas isi koleksi..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#2563EB] px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              {editingItem ? 'Simpan Perubahan' : 'Tambahkan ke Katalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
