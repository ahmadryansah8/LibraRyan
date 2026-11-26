import { Chart, registerables } from 'chart.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DDC_CATEGORIES, getDDCColor } from '../data/seedData';
import { CollectionItem, Transaction } from '../types/library';
import { addDaysISO, getTodayISO } from '../utils/libraryHelpers';

Chart.register(...registerables);

interface AdminChartsProps {
  collections: CollectionItem[];
  transactions: Transaction[];
}

export function AdminCharts({ collections, transactions }: AdminChartsProps) {
  const [trendMode, setTrendMode] = useState<'weekly' | 'monthly'>('weekly');
  const trendCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ddcCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trendChartRef = useRef<Chart | null>(null);
  const ddcChartRef = useRef<Chart | null>(null);

  // Compute Weekly (last 7 days) or Monthly (last 6 months) data
  const trendData = useMemo(() => {
    const todayISO = getTodayISO();

    if (trendMode === 'weekly') {
      const labels: string[] = [];
      const borrowCounts: number[] = [];
      const returnCounts: number[] = [];

      for (let i = -6; i <= 0; i++) {
        const dayISO = addDaysISO(todayISO, i);
        const [y, m, d] = dayISO.split('-').map(Number);
        const dt = new Date(y, m - 1, d);
        labels.push(
          dt.toLocaleDateString('id-ID', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
          })
        );
        borrowCounts.push(
          transactions.filter((t) => t.borrowDate === dayISO).length
        );
        returnCounts.push(
          transactions.filter((t) => t.returnDate === dayISO).length
        );
      }
      return { labels, borrowCounts, returnCounts };
    }

    // Monthly (last 6 months)
    const now = new Date();
    const labels: string[] = [];
    const borrowCounts: number[] = [];
    const returnCounts: number[] = [];

    for (let i = -5; i <= 0; i++) {
      const dt = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const ym = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      labels.push(
        dt.toLocaleDateString('id-ID', {
          month: 'short',
          year: 'numeric',
        })
      );
      borrowCounts.push(
        transactions.filter((t) => t.borrowDate.startsWith(ym)).length
      );
      returnCounts.push(
        transactions.filter((t) => t.returnDate?.startsWith(ym)).length
      );
    }

    return { labels, borrowCounts, returnCounts };
  }, [transactions, trendMode]);

  // Compute DDC distribution
  const ddcStats = useMemo(() => {
    return DDC_CATEGORIES.map((cat) => {
      const items = collections.filter((c) => c.ddcCategory === cat.code);
      return {
        code: cat.code,
        label: cat.shortLabel,
        count: items.length,
        copies: items.reduce((acc, item) => acc + item.totalCopies, 0),
        color: getDDCColor(cat.code),
      };
    }).filter((entry) => entry.count > 0);
  }, [collections]);

  // Render Trend Chart
  useEffect(() => {
    if (!trendCanvasRef.current) return;
    if (trendChartRef.current) {
      trendChartRef.current.destroy();
    }

    trendChartRef.current = new Chart(trendCanvasRef.current, {
      type: 'bar',
      data: {
        labels: trendData.labels,
        datasets: [
          {
            label: 'Peminjaman',
            data: trendData.borrowCounts,
            backgroundColor: '#2563EB',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
          },
          {
            label: 'Pengembalian',
            data: trendData.returnCounts,
            backgroundColor: '#0F172A',
            borderRadius: 6,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: 'rectRounded',
              color: '#334155',
              font: {
                family: 'Plus Jakarta Sans, sans-serif',
                size: 12,
                weight: 500,
              },
            },
          },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { family: 'Plus Jakarta Sans, sans-serif', size: 12 },
            bodyFont: { family: 'Plus Jakarta Sans, sans-serif', size: 12 },
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748B',
              font: { family: 'Plus Jakarta Sans, sans-serif', size: 11 },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
              color: '#64748B',
              font: { family: 'IBM Plex Mono, monospace', size: 11 },
            },
            grid: {
              color: '#E2E8F0',
            },
          },
        },
      },
    });

    return () => {
      trendChartRef.current?.destroy();
      trendChartRef.current = null;
    };
  }, [trendData]);

  // Render DDC Doughnut Chart
  useEffect(() => {
    if (!ddcCanvasRef.current) return;
    if (ddcChartRef.current) {
      ddcChartRef.current.destroy();
    }

    ddcChartRef.current = new Chart(ddcCanvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ddcStats.map((d) => d.label),
        datasets: [
          {
            label: 'Jumlah Judul',
            data: ddcStats.map((d) => d.count),
            backgroundColor: ddcStats.map((d) => d.color),
            borderColor: '#FFFFFF',
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#0F172A',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => {
                const entry = ddcStats[ctx.dataIndex];
                return ` ${entry.count} judul (${entry.copies} eksemplar)`;
              },
            },
          },
        },
      },
    });

    return () => {
      ddcChartRef.current?.destroy();
      ddcChartRef.current = null;
    };
  }, [ddcStats]);

  return (
    <section
      aria-label="Grafik Statistik Perpustakaan"
      className="grid grid-cols-1 gap-6 lg:grid-cols-12"
    >
      {/* Weekly / Monthly Circulation Trend Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A]">
              Tren Sirkulasi Peminjaman & Pengembalian
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Diperbarui langsung dari transaksi sirkulasi aktif
            </p>
          </div>
          <div
            role="group"
            aria-label="Rentang waktu grafik"
            className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5"
          >
            <button
              type="button"
              onClick={() => setTrendMode('weekly')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                trendMode === 'weekly'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Mingguan
            </button>
            <button
              type="button"
              onClick={() => setTrendMode('monthly')}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                trendMode === 'monthly'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              Bulanan
            </button>
          </div>
        </div>

        <div className="h-[260px] w-full">
          <canvas ref={trendCanvasRef} />
        </div>
      </div>

      {/* DDC Distribution Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5">
        <div className="mb-4">
          <h2 className="text-base font-bold text-[#0F172A]">
            Distribusi Koleksi Berdasarkan Kelas DDC
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sebaran judul & eksemplar di katalog OPAC
          </p>
        </div>

        {ddcStats.length === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-xs text-slate-500">
            Belum ada data koleksi untuk ditampilkan.
          </div>
        ) : (
          <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-12">
            <div className="h-[210px] sm:col-span-6">
              <canvas ref={ddcCanvasRef} />
            </div>
            <div className="space-y-1.5 sm:col-span-6">
              {ddcStats.map((entry) => (
                <div
                  key={entry.code}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: entry.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-slate-700">{entry.label}</span>
                  </div>
                  <span className="font-mono font-semibold text-[#0F172A] tabular-nums shrink-0">
                    {entry.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
