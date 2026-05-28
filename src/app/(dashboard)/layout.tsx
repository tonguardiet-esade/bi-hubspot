import { Sidebar } from '@/components/Sidebar';
import { GdprBanner } from '@/components/GdprBanner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <GdprBanner />
      <Sidebar />
      <main className="flex-grow bg-[#030406]">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
