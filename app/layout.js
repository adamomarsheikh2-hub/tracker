export const metadata = {
  title: "Peptide Rotation",
  description: "Injection Tracker",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#09090f" }}>{children}</body>
    </html>
  );
}
