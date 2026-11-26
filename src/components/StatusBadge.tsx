import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { TransactionDisplayStatus } from '../types/library';

interface TransactionStatusProps {
  status: TransactionDisplayStatus;
  overdueDays?: number;
}

export function TransactionStatusTag({ status, overdueDays = 0 }: TransactionStatusProps) {
  if (status === 'Selesai') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-[#16A34A] border border-emerald-200 whitespace-nowrap shrink-0">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Selesai</span>
      </span>
    );
  }

  if (status === 'Terlambat') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-[#DC2626] border border-red-200 whitespace-nowrap shrink-0">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Terlambat{overdueDays > 0 ? ` (${overdueDays} hr)` : ''}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-[#D97706] border border-amber-200 whitespace-nowrap shrink-0">
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>Dipinjam</span>
    </span>
  );
}

interface AvailabilityStatusProps {
  availableCopies: number;
  totalCopies: number;
}

export function AvailabilityTag({ availableCopies, totalCopies }: AvailabilityStatusProps) {
  if (availableCopies > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] whitespace-nowrap shrink-0">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="tabular-nums">
          Tersedia ({availableCopies}/{totalCopies})
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D97706] whitespace-nowrap shrink-0">
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="tabular-nums">Dipinjam (0/{totalCopies})</span>
    </span>
  );
}
