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
									banner.style.backgroundColor = '#f44336'; // Красный фон для привлечения внимания
									banner.style.color = 'white';
									banner.style.padding = '12px';
									banner.style.textAlign = 'center';
									banner.style.zIndex = '9999';
									banner.style.fontSize = '15px';
									banner.style.fontWeight = '500';
									banner.style.display = 'flex';
									banner.style.alignItems = 'center';
									banner.style.justifyContent = 'center';
									banner.style.flexWrap = 'wrap';
									banner.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
									
									// Создаем контейнер для содержимого баннера
									const bannerContent = document.createElement('div');
									bannerContent.style.display = 'flex';
									bannerContent.style.alignItems = 'center';
									bannerContent.style.justifyContent = 'center';
									bannerContent.style.width = '100%';
									bannerContent.style.maxWidth = '960px';
									bannerContent.style.margin = '0 auto';
									
									// Иконка "Внимание"
									const iconSpan = document.createElement('span');
									iconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
									iconSpan.style.marginRight = '10px';
									iconSpan.style.display = 'flex';
									iconSpan.style.alignItems = 'center';
									
									// Текст сообщения
									const messageSpan = document.createElement('span');
									messageSpan.textContent = 'Озвучивание не работает в вашем браузере. Откройте в Chrome, Firefox или Safari для полной функциональности.';
									messageSpan.style.flexGrow = '1';
									messageSpan.style.padding = '0 10px';
									
									// Кнопка открытия во внешнем браузере
									const openBtn = document.createElement('button');
									openBtn.textContent = 'Открыть в поддерживаемом браузере';
									openBtn.style.backgroundColor = 'white';
									openBtn.style.color = '#f44336';
									openBtn.style.border = 'none';
									openBtn.style.borderRadius = '4px';
									openBtn.style.padding = '6px 10px';
									openBtn.style.fontWeight = 'bold';
									openBtn.style.fontSize = '13px';
									openBtn.style.cursor = 'pointer';
									openBtn.style.marginLeft = '10px';
									openBtn.style.whiteSpace = 'nowrap';
									openBtn.onclick = openInExternalBrowser;
									
									// Кнопка закрытия баннера
									const closeBtn = document.createElement('button');
									closeBtn.innerHTML = '×';
									closeBtn.style.background = 'transparent';
									closeBtn.style.border = 'none';
									closeBtn.style.fontSize = '24px';
									closeBtn.style.color = 'white';
									closeBtn.style.cursor = 'pointer';
									closeBtn.style.marginLeft = '10px';
									closeBtn.style.padding = '0 5px';
									closeBtn.onclick = () => {
										banner.style.display = 'none';
										// Сохраняем в localStorage, что баннер был закрыт
										try {
											localStorage.setItem('telegram_speech_banner_closed', 'true');
										} catch (e) {
											console.error('Ошибка при сохранении настройки баннера:', e);
										}
									};
									
									// Проверяем, был ли баннер закрыт ранее
									let bannerWasClosed = false;
									try {
										bannerWasClosed = localStorage.getItem('telegram_speech_banner_closed') === 'true';
									} catch (e) {
										console.error('Ошибка при чтении настройки баннера:', e);
									}
									
									// Если баннер ранее закрывали, не показываем его снова
									if (bannerWasClosed) {
										return;
									}

									// Добавляем все элементы в баннер
									bannerContent.appendChild(iconSpan);
									bannerContent.appendChild(messageSpan);
									bannerContent.appendChild(openBtn);
									bannerContent.appendChild(closeBtn);
									banner.appendChild(bannerContent);
									
									// Добавляем чекбокс для выбора "Всегда открывать во внешнем браузере"
									const checkboxContainer = document.createElement('div');
									checkboxContainer.style.display = 'flex';
									checkboxContainer.style.alignItems = 'center';
									checkboxContainer.style.justifyContent = 'center';
									checkboxContainer.style.marginTop = '8px';
									checkboxContainer.style.width = '100%';

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
									checkboxLabel.style.fontSize = '14px';
									checkboxLabel.style.color = 'white';

									checkboxContainer.appendChild(alwaysRedirectCheckbox);
									checkboxContainer.appendChild(checkboxLabel);
									banner.appendChild(checkboxContainer);
									
									// Добавляем баннер в начало body
									if (document.body.firstChild) {
										document.body.insertBefore(banner, document.body.firstChild);
									} else {
										document.body.appendChild(banner);
									}
								}
							});
						}
					`}
				</Script>
				<Script id='telegram-browser-button' strategy='afterInteractive'>
					{`
						// Добавляем фиксированную кнопку для открытия во внешнем браузере, если озвучивание недоступно
						document.addEventListener('DOMContentLoaded', () => {
							// Проверяем, может ли работать озвучивание
							let speechAvailable = false;
							
							try {
								if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
									// Проверим, можно ли создать объект
									new SpeechSynthesisUtterance('Test');
									
									// Проверим наличие голосов или возможность их загрузки
									window.speechSynthesis.getVoices();
									
									// Считаем API доступным
									speechAvailable = true;
								}
							} catch (e) {
								console.warn('Ошибка при проверке Speech API:', e);
								speechAvailable = false;
							}
							
							// Если озвучивание недоступно, добавляем кнопку
							if (!speechAvailable) {
								// Создаем кнопку для открытия во внешнем браузере
								const openButton = document.createElement('button');
								openButton.id = 'open-in-browser-button';
								openButton.textContent = 'Открыть с озвучиванием';
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
								text.textContent = 'Открыть с озвучиванием';
								
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
							}
						});
					`}
				</Script>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				{children}
			</body>
		</html>
	)
}
