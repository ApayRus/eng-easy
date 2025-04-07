import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import '../styles/audioComponents.css'
import Script from 'next/script'

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
		<html lang='ru'>
			<head>
				<Script id='telegram-web-app-check' strategy='beforeInteractive'>
					{`
						// Проверка на браузер Telegram
						function isTelegramWebApp() {
							return navigator.userAgent.includes('Telegram') || 
								navigator.userAgent.includes('TelegramWebView') ||
								window.Telegram && window.Telegram.WebApp;
						}
						
						// Сохраняем для использования в компонентах
						window.IS_TELEGRAM_WEBAPP = isTelegramWebApp();
						
						// Функция открытия сайта в обычном браузере
						function openInExternalBrowser() {
							const currentUrl = window.location.href;
							const a = document.createElement('a');
							a.href = currentUrl;
							a.target = '_blank';
							a.rel = 'noopener noreferrer';
							a.click();
						}

						// Функция для сохранения выбора пользователя о перенаправлении
						function setRedirectPreference(redirect) {
							try {
								// Сохраняем выбор в cookie на 30 дней
								const expiryDate = new Date();
								expiryDate.setDate(expiryDate.getDate() + 30);
								document.cookie = "always_redirect=" + redirect + "; expires=" + expiryDate.toUTCString() + "; path=/";
							} catch (e) {
								console.error("Ошибка при сохранении настроек:", e);
							}
						}

						// Функция для проверки настроек перенаправления в cookie
						function checkRedirectPreference() {
							try {
								const cookies = document.cookie.split(';');
								for (let i = 0; i < cookies.length; i++) {
									const cookie = cookies[i].trim();
									if (cookie.startsWith("always_redirect=")) {
										return cookie.substring("always_redirect=".length) === "true";
									}
								}
								return false;
							} catch (e) {
								console.error("Ошибка при чтении настроек:", e);
								return false;
							}
						}
						
						// Создаем и добавляем баннер с предупреждением, если это Telegram WebApp
						if (isTelegramWebApp()) {
							// Проверяем параметр в URL для автоматического открытия во внешнем браузере
							const urlParams = new URLSearchParams(window.location.search);
							const autoOpen = urlParams.get('external') === 'true';
							
							// Если есть параметр или пользователь ранее выбрал автоматическое перенаправление
							if (autoOpen || checkRedirectPreference()) {
								console.log("Автоматическое перенаправление во внешний браузер");
								openInExternalBrowser();
							} else {
								// Проверяем, показывали ли мы уже предложение
								let hasShownPrompt = false;
								
								// Безопасная проверка localStorage для SSR
								try {
									if (typeof window !== 'undefined' && window.localStorage) {
										hasShownPrompt = localStorage.getItem("telegram_prompt_shown") === "true";
									}
								} catch (e) {
									console.error("Ошибка при чтении из localStorage:", e);
								}
								
								if (!hasShownPrompt) {
									// Отметим, что показали предложение
									try {
										if (typeof window !== 'undefined' && window.localStorage) {
											localStorage.setItem("telegram_prompt_shown", "true");
										}
									} catch (e) {
										console.error("Ошибка при сохранении флага:", e);
									}
									
									// Показываем модальное окно после загрузки страницы
									setTimeout(() => {
										if (confirm("Для озвучивания и полного функционала рекомендуем открыть сайт во внешнем браузере. Открыть сейчас?")) {
											openInExternalBrowser();
										}
									}, 1000);
								}
							}

							document.addEventListener('DOMContentLoaded', () => {
								// Проверяем, может ли работать озвучивание
								const speechAvailable = 'speechSynthesis' in window && 
									'SpeechSynthesisUtterance' in window;
								
								// Если озвучивание недоступно, показываем баннер
								if (!speechAvailable) {
									const banner = document.createElement('div');
									banner.style.position = 'fixed';
									banner.style.top = '0';
									banner.style.left = '0';
									banner.style.right = '0';
									banner.style.backgroundColor = 'rgba(255, 193, 7, 0.9)';
									banner.style.color = '#333';
									banner.style.padding = '10px';
									banner.style.textAlign = 'center';
									banner.style.zIndex = '9999';
									banner.style.fontSize = '14px';
									banner.style.display = 'flex';
									banner.style.alignItems = 'center';
									banner.style.justifyContent = 'space-between';
									banner.style.flexWrap = 'wrap';
									
									const messageSpan = document.createElement('span');
									messageSpan.textContent = 'Для озвучивания рекомендуем открыть сайт в обычном браузере';
									messageSpan.style.flexGrow = '1';
									messageSpan.style.padding = '0 10px';
									
									const closeBtn = document.createElement('button');
									closeBtn.innerHTML = '×';
									closeBtn.style.background = 'none';
									closeBtn.style.border = 'none';
									closeBtn.style.fontSize = '20px';
									closeBtn.style.cursor = 'pointer';
									closeBtn.style.marginLeft = '10px';
									closeBtn.onclick = () => banner.style.display = 'none';
									
									const openBtn = document.createElement('button');
									openBtn.textContent = 'Открыть';
									openBtn.style.backgroundColor = '#2563eb';
									openBtn.style.color = 'white';
									openBtn.style.border = 'none';
									openBtn.style.borderRadius = '4px';
									openBtn.style.padding = '5px 10px';
									openBtn.style.cursor = 'pointer';
									openBtn.style.marginLeft = '10px';
									openBtn.onclick = openInExternalBrowser;

									// Добавляем чекбокс для сохранения выбора
									const checkboxContainer = document.createElement('div');
									checkboxContainer.style.display = 'flex';
									checkboxContainer.style.alignItems = 'center';
									checkboxContainer.style.marginTop = '5px';
									checkboxContainer.style.width = '100%';
									checkboxContainer.style.justifyContent = 'center';

									const alwaysRedirectCheckbox = document.createElement('input');
									alwaysRedirectCheckbox.type = 'checkbox';
									alwaysRedirectCheckbox.id = 'always-redirect';
									alwaysRedirectCheckbox.style.marginRight = '5px';
									alwaysRedirectCheckbox.checked = checkRedirectPreference();
									alwaysRedirectCheckbox.onchange = () => {
										setRedirectPreference(alwaysRedirectCheckbox.checked);
									};

									const checkboxLabel = document.createElement('label');
									checkboxLabel.htmlFor = 'always-redirect';
									checkboxLabel.textContent = 'Всегда открывать во внешнем браузере';
									checkboxLabel.style.fontSize = '12px';

									checkboxContainer.appendChild(alwaysRedirectCheckbox);
									checkboxContainer.appendChild(checkboxLabel);
									
									banner.appendChild(messageSpan);
									banner.appendChild(openBtn);
									banner.appendChild(closeBtn);
									document.body.appendChild(banner);
									document.body.appendChild(checkboxContainer);
								}
							});
						}
					`}
				</Script>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				{children}
			</body>
		</html>
	)
}
