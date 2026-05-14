import { SiteFooter } from "@/components/layout/site-footer";
import { clientPortalGutterX } from "@/constants";

/**
 * Public client portal: no sidebar; footer only on this branch.
 */
export default function ClientPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className={`flex-1 py-8 sm:py-10 lg:py-12 ${clientPortalGutterX}`}>{children}</div>
      <SiteFooter />
    </div>
  );
}
