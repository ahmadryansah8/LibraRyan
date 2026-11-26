import { BookOpen, Check, Copy, Headphones, MapPin, Pause, Play, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CollectionItem } from '../types/library';

interface CollectionReaderModalProps {
  item: CollectionItem | null;
  onClose: () => void;
}

export function CollectionReaderModal({ item, onClose }: CollectionReaderModalProps) {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressSec, setProgressSec] = useState(42);
  const [copiedCitation, setCopiedCitation] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setProgressSec(42);
    setCopiedCitation(false);
  }, [item]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setProgressSec((prev) => (prev >= 300 ? 0 : prev + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  if (!item) return null;

  const citationText = `${item.author} (${item.year}). ${item.title}. ${item.publisher}. Klasifikasi DDC: ${item.ddcNumber} (${item.callNumber}).`;

  const handleCopyCitation = async () => {
    try {
      await navigator.clipboard.writeText(citationText);
      setCopiedCitation(true);
      window.setTimeout(() => setCopiedCitation(false), 2000);
    } catch {
      setCopiedCitation(true);
    }
  };

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#0F172A] px-6 py-4 text-white">
          <div className="min-w-0">
            <p className="text-xs text-slate-300">
              Akses Koleksi · {item.format} · {item.durationOrPages}
            </p>
            <h2 id="reader-modal-title" className="truncate text-base font-bold mt-0.5">
              {item.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pembaca koleksi"
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {item.format === 'Audiobook' ? (
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#2563EB] text-white shrink-0">
                  <Headphones className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Pemutar Audiobook Digital</p>
                  <p className="text-xs text-slate-500">Narasi oleh Tim Pustaka Suara · {item.durationOrPages}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 tabular-nums mb-1.5">
                  <span>Bab 1: Prolog</span>
                  <span>{formatSec(progressSec)} / 05:00</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-[#2563EB] transition-all duration-300"
                    style={{ width: `${(progressSec / 300) * 100}%` }}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4" aria-hidden="true" />
                        <span>Jeda Audio</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" aria-hidden="true" />
                        <span>Putar Cuplikan Audio</span>
                      </>
                    )}
                  </button>
                  <span className="text-xs text-slate-500">Kualitas Streaming: 192 kbps</span>
                </div>
              </div>
            </div>
          ) : item.format === 'Buku Referensi' ? (
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#2563EB] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Panduan Lokasi Rak & Akses Fisik</p>
                  <p className="text-sm text-slate-600 mt-0.5">{item.shelfLocation}</p>
                  <p className="text-xs font-mono text-slate-500 mt-1">
                    Nomor Panggil: {item.callNumber} · DDC {item.ddcNumber}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Readable Excerpt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <BookOpen className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                <span>Kutipan Naskah & Ringkasan Isi</span>
              </div>
              <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 p-0.5 text-xs">
                {(['sm', 'base', 'lg'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFontSize(sz)}
                    className={`rounded px-2 py-0.5 font-medium ${
                      fontSize === sz
                        ? 'bg-[#0F172A] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sz === 'sm' ? 'A-' : sz === 'base' ? 'A' : 'A+'}
                  </button>
                ))}
              </div>
            </div>
            <div
              className={`rounded-lg border border-slate-200 bg-white p-5 leading-relaxed text-slate-700 ${
                fontSize === 'sm' ? 'text-xs' : fontSize === 'base' ? 'text-sm' : 'text-base'
              }`}
            >
              <p className="font-semibold text-[#0F172A] mb-2">{item.title}</p>
              <p>{item.sampleExcerpt}</p>
              <p className="mt-3 text-slate-500">{item.synopsis}</p>
            </div>
          </div>

          {/* Citation Helper */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500">Sitasi Bibliografi</p>
              <p className="truncate text-xs text-slate-700 mt-0.5">{citationText}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyCitation}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-[#0F172A] hover:bg-slate-100 transition-colors shrink-0"
            >
              {copiedCitation ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#16A34A]" aria-hidden="true" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                  <span>Salin Sitasi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
