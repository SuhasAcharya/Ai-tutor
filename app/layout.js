import "./globals.css";

export const metadata = {
  title: 'Namma Bhashe',
  description: 'Learn Kannada with AI',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
