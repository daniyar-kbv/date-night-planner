import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Приглашение на свидание 💌',
  description: 'Одно маленькое приглашение для самого любимого человека.',
  openGraph: {
    title: 'Для тебя кое-что есть 💌',
    description: 'Открой маленькое приглашение от любимого человека.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
