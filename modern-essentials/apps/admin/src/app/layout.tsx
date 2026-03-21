import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Modern Essentials Admin',
  description: 'Ops dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
