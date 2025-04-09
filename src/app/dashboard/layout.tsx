import { Dashboard } from './_components/dashboard'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div>
      <Dashboard>{children}</Dashboard>
    </div>
  )
}
