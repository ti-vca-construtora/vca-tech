import { Dashboard } from "./_components/dashboard";
import { BreadcrumbProvider } from "@/providers/breadcrumb-provider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BreadcrumbProvider>
      <div>
        <Dashboard>{children}</Dashboard>
      </div>
    </BreadcrumbProvider>
  );
}
