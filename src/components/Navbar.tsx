import { BookOpen, ShieldCheck, User } from 'lucide-react';
import { AdminTab, MemberTab, UserRole } from '../types/library';

interface NavbarProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  memberTab: MemberTab;
  onMemberTabChange: (tab: MemberTab) => void;
  adminTab: AdminTab;
  onAdminTabChange: (tab: AdminTab) => void;
}

export function Navbar({
  activeRole,
  onRoleChange,
  memberTab,
  onMemberTabChange,
  adminTab,
  onAdminTabChange,
}: NavbarProps) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            if (activeRole === 'member') onMemberTabChange('opac');
            else onAdminTabChange('overview');
          }}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-md"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F172A] text-white">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-[#0F172A]">
            LibraRyan
          </span>
        </button>

        {/* Zone 2: Clean Contextual Navigation Links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          {activeRole === 'member' ? (
            <>
              <button
                type="button"
                onClick={() => onMemberTabChange('opac')}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  memberTab === 'opac'
                    ? 'border-[#2563EB] text-[#0F172A] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                Katalog OPAC
              </button>
              <button
                type="button"
                onClick={() => onMemberTabChange('dashboard')}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  memberTab === 'dashboard'
                    ? 'border-[#2563EB] text-[#0F172A] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                Dashboard Pemustaka
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onAdminTabChange('overview')}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  adminTab === 'overview'
                    ? 'border-[#2563EB] text-[#0F172A] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                Monitoring & Statistik
              </button>
              <button
                type="button"
                onClick={() => onAdminTabChange('collections')}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  adminTab === 'collections'
                    ? 'border-[#2563EB] text-[#0F172A] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                Manajemen Koleksi
              </button>
              <button
                type="button"
                onClick={() => onAdminTabChange('reports')}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  adminTab === 'reports'
                    ? 'border-[#2563EB] text-[#0F172A] font-semibold'
                    : 'border-transparent text-slate-600 hover:text-[#0F172A]'
                }`}
              >
                Laporan Sirkulasi
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Real-Time Role Switcher */}
        <div
          role="group"
          aria-label="Pengalih Peran"
          className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 shrink-0"
        >
          <button
            type="button"
            onClick={() => onRoleChange('member')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeRole === 'member'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Portal Member</span>
          </button>
          <button
            type="button"
            onClick={() => onRoleChange('admin')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeRole === 'admin'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Dashboard Admin</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Navigation Strip */}
      <div className="flex md:hidden items-center gap-4 overflow-x-auto border-t border-slate-100 px-4 py-2 text-xs font-medium">
        {activeRole === 'member' ? (
          <>
            <button
              type="button"
              onClick={() => onMemberTabChange('opac')}
              className={`py-1 whitespace-nowrap shrink-0 border-b-2 ${
                memberTab === 'opac'
                  ? 'border-[#2563EB] text-[#0F172A] font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Katalog OPAC
            </button>
            <button
              type="button"
              onClick={() => onMemberTabChange('dashboard')}
              className={`py-1 whitespace-nowrap shrink-0 border-b-2 ${
                memberTab === 'dashboard'
                  ? 'border-[#2563EB] text-[#0F172A] font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Dashboard Pemustaka
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onAdminTabChange('overview')}
              className={`py-1 whitespace-nowrap shrink-0 border-b-2 ${
                adminTab === 'overview'
                  ? 'border-[#2563EB] text-[#0F172A] font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Monitoring & Statistik
            </button>
            <button
              type="button"
              onClick={() => onAdminTabChange('collections')}
              className={`py-1 whitespace-nowrap shrink-0 border-b-2 ${
                adminTab === 'collections'
                  ? 'border-[#2563EB] text-[#0F172A] font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Manajemen Koleksi
            </button>
            <button
              type="button"
              onClick={() => onAdminTabChange('reports')}
              className={`py-1 whitespace-nowrap shrink-0 border-b-2 ${
                adminTab === 'reports'
                  ? 'border-[#2563EB] text-[#0F172A] font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Laporan Sirkulasi
            </button>
          </>
        )}
      </div>
    </header>
  );
}
