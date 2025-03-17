import { Dashboard } from './_components/dashboard'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`antialiased flex`}>
        <Dashboard>{children}</Dashboard>
      </body>
    </html>
  )
}
