import { PortfolioAppShell } from "@/components/layout/portfolio-app-shell";

export default function PortfolioMainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PortfolioAppShell>{children}</PortfolioAppShell>;
}
