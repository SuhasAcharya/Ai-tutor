import "./globals.css";

export const metadata = {
  title: 'Kannada AI Tutor',
  description: 'Learn Kannada with AI',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
