import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CHEM LAB | 웹 화학실험실 시뮬레이터',
  description: '물질과 실험 조건을 선택해 화학 반응을 설계하는 웹 실험실 시뮬레이터',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
