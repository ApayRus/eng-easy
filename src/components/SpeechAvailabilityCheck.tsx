'use client'

import { useState, useEffect } from 'react'
import './AudioTextLine.css' // используем уже существующие стили

/**
 * Проверяет доступность Speech API
 * Учитывает особенности Telegram WebView и других браузеров
 */
const isSpeechSynthesisAvailable = () => {
	try {
		// Проверка на in-app браузеры, которые могут ограничивать функциональность
		const userAgent =
			typeof navigator !== 'undefined' ? navigator.userAgent : ''
		const isTelegramWebView =
			typeof window !== 'undefined' &&
			(window.IS_TELEGRAM_WEBAPP === true ||
				userAgent.includes('Telegram') ||
				userAgent.includes('TelegramWebView'))

		// Telegram WebView всегда считаем недоступным для озвучивания,
		// даже если есть заглушки для API
		if (isTelegramWebView) {
			console.log(
				'Telegram WebView detected, treating speech synthesis as unavailable'
			)
			return false
		}

		// Основная проверка доступности API
		const hasAPI =
			typeof window !== 'undefined' &&
			'speechSynthesis' in window &&
			'SpeechSynthesisUtterance' in window

		// Дополнительная проверка - попытка получить голоса
		if (hasAPI) {
			// Некоторые браузеры возвращают пустой массив, если API не полностью поддерживается
			try {
				// Проверяем наличие метода getVoices
				if (typeof window.speechSynthesis.getVoices !== 'function') {
					console.warn('getVoices method is not available in this browser')
					return false
				}

				const voices = window.speechSynthesis.getVoices()

				// В некоторых браузерах getVoices() может возвращаться асинхронно
				// В этом случае мы будем считать, что API доступен, пока не доказано обратное
				if (voices && voices.length === 0) {
					// Логируем, но все равно разрешаем (голоса могут загрузиться позже)
					console.log('No voices available immediately, may load later')
				}
			} catch (e) {
				console.warn('Error checking voices availability:', e)
				return false
			}
		}

		return hasAPI
	} catch (e) {
		console.error('Error checking speech synthesis availability:', e)
		return false
	}
}

/**
 * Проверка на Telegram WebView
 */
const isTelegramWebViewBrowser = () => {
	try {
		const userAgent =
			typeof navigator !== 'undefined' ? navigator.userAgent : ''
		return (
			typeof window !== 'undefined' &&
			(window.IS_TELEGRAM_WEBAPP === true ||
				userAgent.includes('Telegram') ||
				userAgent.includes('TelegramWebView'))
		)
	} catch (e) {
		console.error('Error checking Telegram WebView:', e)
		return false
	}
}

/**
 * Компонент для проверки доступности речевого синтеза
 * Отображает предупреждение, если озвучивание недоступно
 */
export default function SpeechAvailabilityCheck() {
	const [isClient, setIsClient] = useState(false)
	const [speechAvailable, setSpeechAvailable] = useState(true) // Изначально true, чтобы не мигало при загрузке
	const [isTelegramWebView, setIsTelegramWebView] = useState(false)

	useEffect(() => {
		setIsClient(true)

		// Проверка на Telegram WebView
		setIsTelegramWebView(isTelegramWebViewBrowser())

		// Проверка доступности API только на клиенте
		if (typeof window !== 'undefined') {
			const available = isSpeechSynthesisAvailable()
			setSpeechAvailable(available)

			// Если API доступен (и это не Telegram), проверим еще и голоса
			if (available && !isTelegramWebViewBrowser()) {
				try {
					// Проверяем наличие метода getVoices
					if (typeof window.speechSynthesis.getVoices !== 'function') {
						console.warn('getVoices method is not available in this browser')
						return
					}

					// Попробуем загрузить голоса
					const voices = window.speechSynthesis.getVoices()

					// Если голоса недоступны сразу, подпишемся на событие изменения голосов
					if (!voices || voices.length === 0) {
						const checkVoices = () => {
							try {
								if (typeof window.speechSynthesis.getVoices !== 'function') {
									return
								}

								const updatedVoices = window.speechSynthesis.getVoices()
								if (updatedVoices && updatedVoices.length > 0) {
									setSpeechAvailable(true)
								}
							} catch (e) {
								console.warn('Error in checkVoices:', e)
							}
						}

						try {
							// Проверяем наличие addEventListener
							if (
								window.speechSynthesis &&
								'addEventListener' in window.speechSynthesis
							) {
								window.speechSynthesis.addEventListener(
									'voiceschanged',
									checkVoices
								)

								// Попробуем еще раз через таймаут, на случай если событие не сработает
								setTimeout(checkVoices, 1000)

								return () => {
									try {
										if (
											window.speechSynthesis &&
											'removeEventListener' in window.speechSynthesis
										) {
											window.speechSynthesis.removeEventListener(
												'voiceschanged',
												checkVoices
											)
										}
									} catch (e) {
										console.warn('Error removing voice event listener:', e)
									}
								}
							}
						} catch (e) {
							console.warn('Error setting up voice event listeners:', e)
						}
					}
				} catch (e) {
					console.error('Error checking voices availability:', e)
					setSpeechAvailable(false)
				}
			}
		}
	}, [])

	// На сервере ничего не рендерим
	if (!isClient) {
		return null
	}

	// Если озвучивание доступно и это не Telegram WebView, ничего не рендерим
	if (speechAvailable && !isTelegramWebView) {
		return null
	}

	// Особое сообщение для Telegram WebView
	const message = isTelegramWebView
		? 'В браузере Telegram озвучивание не работает. Откройте в Chrome или другом браузере.'
		: 'Озвучивание не работает. Откройте страницу в другом браузере.'

	// Рендерим предупреждение
	return (
		<div className='speech-warning-banner' data-speech-warning='true'>
			<div className='warning-content'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width='20'
					height='20'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'></path>
					<line x1='12' y1='9' x2='12' y2='13'></line>
					<line x1='12' y1='17' x2='12.01' y2='17'></line>
				</svg>
				<span>{message}</span>
			</div>
		</div>
	)
}
