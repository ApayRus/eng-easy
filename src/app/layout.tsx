import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import '../styles/audioComponents.css'
const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin']
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin']
})

export const metadata: Metadata = {
	title: 'EngEasy - Изучай английский легко',
	description: 'Интерактивные уроки и материалы для изучения английского языка',
	manifest: '/images/favicon/site.webmanifest',
	icons: {
		icon: [
			{
				url: '/images/favicon/favicon-16x16.png',
				sizes: '16x16',
				type: 'image/png'
			},
			{
				url: '/images/favicon/favicon-32x32.png',
				sizes: '32x32',
				type: 'image/png'
			}
		],
		apple: {
			url: '/images/favicon/apple-touch-icon.png',
			sizes: '180x180',
			type: 'image/png'
		},
		other: [
			{
				rel: 'mask-icon',
				url: '/images/favicon/android-chrome-192x192.png',
				sizes: '192x192'
			},
			{
				rel: 'mask-icon',
				url: '/images/favicon/android-chrome-512x512.png',
				sizes: '512x512'
			}
		]
	},
	openGraph: {
		title: 'EngEasy - Изучай английский легко',
		description:
			'Интерактивные уроки и материалы для изучения английского языка',
		images: '/images/favicon/android-chrome-512x512.png'
	},
	twitter: {
		card: 'summary_large_image',
		title: 'EngEasy - Изучай английский легко',
		description:
			'Интерактивные уроки и материалы для изучения английского языка',
		images: '/images/favicon/android-chrome-512x512.png'
	}
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='ru' suppressHydrationWarning>
			<head>
				{/* Eruda будет загружен всегда, но активирован только по условию */}
				<Script
					src='//cdn.jsdelivr.net/npm/eruda'
					strategy='beforeInteractive'
				/>
				<Script id='eruda-init' strategy='afterInteractive'>
					{`
					// Инициализируем Eruda только если:
					// 1. В URL есть параметр debug=true ИЛИ
					// 2. Находимся в браузере Telegram
					(function() {
						try {
							const urlParams = new URLSearchParams(window.location.search);
							const isDebug = urlParams.get('debug') === 'true';
							const userAgent = navigator.userAgent;
							const isTelegramWebView = userAgent.includes('Telegram') || 
								userAgent.includes('TelegramWebView');
							
							if (isDebug || isTelegramWebView) {
								console.log('Debug mode activated');
								eruda.init();
							}
						} catch (e) {
							console.error('Error initializing debug tools:', e);
						}
					})();
					`}
				</Script>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable}`}
				suppressHydrationWarning
			>
				{children}
			</body>
		</html>
	)
}
