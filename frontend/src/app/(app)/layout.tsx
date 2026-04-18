export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-base text-primary">
      {/* Sidebar — próximamente */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
