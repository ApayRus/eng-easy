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
								let speechAvailable = false;
								
								try {
									// Более тщательная проверка SpeechSynthesis API
									if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
										// Проверим, можно ли создать объект
										new SpeechSynthesisUtterance('Test');
										
										// Проверим наличие голосов или возможность их загрузки
										const voices = window.speechSynthesis.getVoices();
										
										// Даже если нет голосов сейчас, считаем API доступным
										// (они могут загрузиться позже)
										speechAvailable = true;
										
										// Вывод информации в консоль для дебага
										console.log('Speech API проверка в Telegram браузере: API доступен, голосов:', voices?.length || 0);
									}
								} catch (e) {
									console.warn('Ошибка при проверке Speech API:', e);
									speechAvailable = false;
								}
								
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
									messageSpan.textContent = 'Озвучивание может быть недоступно в Telegram браузере. Рекомендуем открыть в обычном браузере.';
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
				<Script id='telegram-browser-button' strategy='afterInteractive'>
					{`
						// Добавляем фиксированную кнопку для открытия во внешнем браузере, если мы в Telegram
						if (window.IS_TELEGRAM_WEBAPP) {
							document.addEventListener('DOMContentLoaded', () => {
								// Создаем кнопку для открытия во внешнем браузере
								const openButton = document.createElement('button');
								openButton.id = 'open-in-browser-button';
								openButton.textContent = 'Открыть в браузере';
								openButton.style.position = 'fixed';
								openButton.style.right = '20px';
								openButton.style.bottom = '20px';
								openButton.style.zIndex = '9999';
								openButton.style.backgroundColor = '#2563eb';
								openButton.style.color = 'white';
								openButton.style.border = 'none';
								openButton.style.borderRadius = '50px';
								openButton.style.padding = '10px 16px';
								openButton.style.fontSize = '14px';
								openButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
								openButton.style.cursor = 'pointer';
								openButton.style.display = 'flex';
								openButton.style.alignItems = 'center';
								openButton.style.justifyContent = 'center';
								openButton.style.transition = 'all 0.2s ease';
								
								// Добавляем иконку
								const icon = document.createElement('span');
								icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
								
								// Добавляем текст
								const text = document.createElement('span');
								text.textContent = 'Открыть в браузере';
								
								// Собираем кнопку
								openButton.appendChild(icon);
								openButton.appendChild(text);
								
								// Добавляем обработчик события
								openButton.onclick = function() {
									const currentUrl = window.location.href;
									// Добавляем параметр для автоматического открытия
									let url = currentUrl;
									if (url.includes('?')) {
										url += '&external=true';
									} else {
										url += '?external=true';
									}
									
									// Открываем во внешнем браузере
									const a = document.createElement('a');
									a.href = url;
									a.target = '_blank';
									a.rel = 'noopener noreferrer';
									
									// Добавляем эффект нажатия
									openButton.style.transform = 'scale(0.95)';
									setTimeout(() => {
										openButton.style.transform = 'scale(1)';
										a.click();
									}, 150);
								};
								
								// Анимация появления кнопки через 2 секунды
								openButton.style.opacity = '0';
								document.body.appendChild(openButton);
								
								setTimeout(() => {
									openButton.style.opacity = '1';
									
									// Добавляем эффект пульсации после появления кнопки
									const addPulseEffect = () => {
										// Создаем стиль анимации, если его еще нет
										if (!document.getElementById('pulse-animation-style')) {
											const style = document.createElement('style');
											style.id = 'pulse-animation-style';
											style.innerHTML = 
												'@keyframes pulse-button {' +
												'0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); transform: scale(1); }' +
												'70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); transform: scale(1.05); }' +
												'100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); transform: scale(1); }' +
												'}' +
												'.pulse-effect {' +
												'animation: pulse-button 2s infinite;' +
												'}';
											document.head.appendChild(style);
										}
										
										// Добавляем класс пульсации к кнопке
										openButton.classList.add('pulse-effect');
										
										// Останавливаем пульсацию при наведении или клике
										openButton.addEventListener('mouseover', () => {
											openButton.classList.remove('pulse-effect');
										});
										
										openButton.addEventListener('click', () => {
											openButton.classList.remove('pulse-effect');
										});
									};
									
									// Запускаем эффект пульсации через 2 секунды после отображения кнопки
									setTimeout(addPulseEffect, 2000);
								}, 1000);
								
								// Добавляем эффект при наведении
								openButton.onmouseover = function() {
									this.style.backgroundColor = '#1e40af';
									this.style.transform = 'translateY(-2px)';
									this.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)';
								};
								
								openButton.onmouseout = function() {
									this.style.backgroundColor = '#2563eb';
									this.style.transform = 'translateY(0)';
									this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
								};
								
								// Адаптация для мобильных устройств
								function adjustForMobile() {
									const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
									
									if (width <= 768) {
										// Мобильный вид
										openButton.style.padding = '8px 12px';
										openButton.style.fontSize = '12px';
										openButton.style.right = '10px';
										openButton.style.bottom = '10px';
									} else {
										// Десктопный вид
										openButton.style.padding = '10px 16px';
										openButton.style.fontSize = '14px';
										openButton.style.right = '20px';
										openButton.style.bottom = '20px';
									}
									
									// Если очень маленький экран, скрываем текст, оставляем только иконку
									if (width <= 360) {
										text.style.display = 'none';
										icon.style.marginRight = '0';
										openButton.style.padding = '8px';
									} else {
										text.style.display = 'inline';
										icon.style.marginRight = '6px';
									}
								}
								
								// Вызываем функцию при загрузке и при изменении размера окна
								adjustForMobile();
								window.addEventListener('resize', adjustForMobile);
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
