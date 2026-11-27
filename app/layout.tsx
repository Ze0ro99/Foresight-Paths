import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'مرصد المسارات الاستشرافي — تحليل المخاطر الرقمية وسيناريو الاستقرار العالمي',
  description:
    'منصة بحثية واستشرافية لرسم خرائط المسارات اللحظية، تحليل الخريطتين والمعادلات الرياضية مع باي (π)، رصد التهديدات، وبناء سيناريو الفيلم العالمي الواقعي.',
  openGraph: {
    title: 'مرصد المسارات الاستشرافي — تحليل المخاطر الرقمية وسيناريو الاستقرار العالمي',
    description:
      'منصة بحثية واستشرافية لرسم خرائط المسارات اللحظية وتحليل المخاطر المتسلسلة في البنية التحتية الرقمية.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مرصد المسارات الاستشرافي — تحليل المخاطر الرقمية وسيناريو الاستقرار العالمي',
    description:
      'منصة بحثية واستشرافية لرسم خرائط المسارات اللحظية وتحليل المخاطر المتسلسلة في البنية التحتية الرقمية.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        suppressHydrationWarning
        className="bg-[#07070B] text-[#F3F4F6] antialiased selection:bg-[#9333EA]/30 selection:text-white"
      >
        {children}
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
