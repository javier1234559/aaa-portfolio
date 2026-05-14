/**
 * Shell for all `/app/*` routes. Sidebar lives in `(main)/layout.tsx` only —
 * client portal `/app/publish/[slug]` stays outside `(main)` so it renders full-width without nav.
 */
export default function AppBranchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
