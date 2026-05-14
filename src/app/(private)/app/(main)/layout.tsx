import { PortfolioSidebar } from "@/components/layout/portfolio-sidebar";

export default function PortfolioMainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <PortfolioSidebar />
      <main className="ml-64 min-h-screen min-w-0 flex-1 p-12">{children}</main>
    </div>
  );
}
