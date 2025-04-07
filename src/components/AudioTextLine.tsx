/**
 * Компонент AudioTextLine - отображает строку текста с возможностью озвучивания
 * Реализует надежное обнаружение и использование Web Speech API
 * с учетом особенностей работы в различных браузерах, включая Telegram WebView
 */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSpeechRate } from './SpeechControls'
import './AudioTextLine.css'

interface AudioTextLineProps {
	text: string
}

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

		// Основная проверка доступности API
		const hasAPI =
			typeof window !== 'undefined' &&
			'speechSynthesis' in window &&
			'SpeechSynthesisUtterance' in window

		// Если Telegram WebView, то проведем дополнительные проверки вместо полного блокирования
		if (isTelegramWebView && hasAPI) {
			console.log(
				'Telegram WebView detected, testing speech synthesis availability'
			)

			// Попробуем создать объект SpeechSynthesisUtterance и получить список голосов
			try {
				new SpeechSynthesisUtterance('Test') // Просто проверяем, можно ли создать объект

				// Проверка доступности голосов
				const voices = window.speechSynthesis.getVoices()

				// Логгируем результат для дебага
				console.log(
					'Speech API in Telegram: API available, voices count:',
					voices ? voices.length : 0
				)

				// Даже если нет голосов сейчас, они могут загрузиться позже через событие voiceschanged
				return true
			} catch (e) {
				console.warn('Speech API testing in Telegram failed:', e)
				return false
			}
		}

		// Дополнительная проверка - попытка получить голоса
		if (hasAPI) {
			// Некоторые браузеры возвращают пустой массив, если API не полностью поддерживается
			const voices = window.speechSynthesis.getVoices()

			// В некоторых браузерах getVoices() может возвращаться асинхронно
			// В этом случае мы будем считать, что API доступен, пока не доказано обратное
			if (voices && voices.length === 0) {
				// Логируем, но все равно разрешаем (голоса могут загрузиться позже)
				console.log('No voices available immediately, may load later')
			}
		}

		return hasAPI
	} catch (e) {
		console.error('Error checking speech synthesis availability:', e)
		return false
	}
}

export default function AudioTextLine({ text }: AudioTextLineProps) {
	const [isClient, setIsClient] = useState(false)
	const [isSpeaking, setIsSpeaking] = useState(false)
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
	const [speechAvailable, setSpeechAvailable] = useState(false) // Изначально false для SSR
	const [showWarning, setShowWarning] = useState(false) // Для контроля отображения баннера

	// Split the text into sections
	const sections = text.split(' / ').map(section => section.trim())

	/**
	 * Ищет наиболее подходящий английский голос по приоритетам:
	 * 1. Нативный голос en-US или en-GB (не localService)
	 * 2. Любой голос с языком en-US или en-GB
	 * 3. Любой голос, начинающийся с 'en'
	 * 4. Первый доступный голос в списке
	 * @returns Найденный голос SpeechSynthesisVoice или null если голоса не доступны
	 */
	const findBestEnglishVoice = useCallback(() => {
		if (voices.length === 0) return null

		// Priority 1: Try to find a native English voice with 'en-US' or 'en-GB' locale
		const nativeEnglishVoice = voices.find(
			voice =>
				(voice.lang === 'en-US' || voice.lang === 'en-GB') &&
				!voice.localService
		)
		if (nativeEnglishVoice) return nativeEnglishVoice

		// Priority 2: Any voice with 'en-US' or 'en-GB' locale
		const anyEnglishUsGbVoice = voices.find(
			voice => voice.lang === 'en-US' || voice.lang === 'en-GB'
		)
		if (anyEnglishUsGbVoice) return anyEnglishUsGbVoice

		// Priority 3: Any voice that starts with 'en'
		const anyEnglishVoice = voices.find(
			voice => voice.lang && voice.lang.startsWith('en')
		)
		if (anyEnglishVoice) return anyEnglishVoice

		// Fallback: Just return the first voice
		return voices[0]
	}, [voices])

	// Function to load and set available voices
	const loadVoices = useCallback(() => {
		if (!isClient) return

		if (!isSpeechSynthesisAvailable()) {
			setSpeechAvailable(false)
			return
		}

		try {
			const availableVoices = window.speechSynthesis.getVoices()
			if (availableVoices && availableVoices.length > 0) {
				setVoices(availableVoices)
				setSpeechAvailable(true)
			} else {
				// Запланируем повторную попытку
				setTimeout(loadVoices, 200)
			}
		} catch (e) {
			console.error('Error loading voices:', e)
			setSpeechAvailable(false)
		}
	}, [isClient])

	// Проверка должна ли отображаться предупреждение
	useEffect(() => {
		if (isClient && !speechAvailable && typeof document !== 'undefined') {
			const warningExists = document.querySelector(
				'[data-speech-warning="true"]'
			)
			setShowWarning(!warningExists)
		}
	}, [isClient, speechAvailable])

	// Инициализация клиентского состояния и проверка Speech API
	useEffect(() => {
		setIsClient(true)

		// Всю работу с браузерным API делаем только на клиенте
		if (typeof window !== 'undefined') {
			// Проверяем доступность API
			const available = isSpeechSynthesisAvailable()
			setSpeechAvailable(available)

			if (available) {
				// Загружаем голоса
				loadVoices()

				// Подписываемся на изменения голосов
				window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

				// Отписываемся при размонтировании
				return () => {
					window.speechSynthesis.removeEventListener(
						'voiceschanged',
						loadVoices
					)
				}
			}
		}
	}, [loadVoices])

	/**
	 * Функция для безопасного запуска синтеза речи с учетом состояния синтезатора
	 * Решает проблему с первым запуском и ошибками при одновременных вызовах
	 * @param utterance - объект SpeechSynthesisUtterance для воспроизведения
	 */
	const safelySpeakUtterance = (utterance: SpeechSynthesisUtterance) => {
		try {
			// Проверяем состояние синтезатора речи
			if (window.speechSynthesis.speaking) {
				console.log('Speech synthesis is already speaking, cancelling...')
				window.speechSynthesis.cancel()
				// Небольшая задержка для сброса состояния
				setTimeout(() => {
					window.speechSynthesis.speak(utterance)
				}, 50)
			} else {
				// Запускаем синтез напрямую
				window.speechSynthesis.speak(utterance)
			}
		} catch (e) {
			console.error('Error in safelySpeakUtterance:', e)
		}
	}

	/**
	 * Основная функция для озвучивания английского текста
	 * Содержит проверки доступности API, голосов и обработку ошибок
	 * Реализует механизм повторных попыток при ошибках
	 */
	const speakText = () => {
		// Если озвучивание недоступно, ничего не делаем
		if (!isClient || !speechAvailable) {
			return
		}

		try {
			// Дополнительная проверка доступности Speech API
			if (!window.speechSynthesis) {
				console.warn('Speech synthesis is not available')
				return
			}

			// Stop any ongoing speech
			window.speechSynthesis.cancel()

			// Get the English text (first section)
			const englishText = sections[0]
			if (!englishText || englishText.trim() === '') {
				console.warn('No text to speak')
				return
			}

			// Убедимся, что у нас есть голоса или запросим их загрузку
			if (voices.length === 0) {
				console.log('No voices available, attempting to load voices')

				// Пробуем перезагрузить голоса
				const availableVoices = window.speechSynthesis.getVoices()
				if (availableVoices && availableVoices.length > 0) {
					console.log(`Found ${availableVoices.length} voices on demand`)
					setVoices(availableVoices)
				} else {
					// Если голоса все еще не загружены, повторим попытку через таймаут
					console.log(
						'Voices not ready yet, attempting to speak with default voice'
					)
				}
			}

			// Create a new speech synthesis utterance
			const utterance = new SpeechSynthesisUtterance(englishText)

			// Set language explicitly to English
			utterance.lang = 'en-US'

			// Get current speech rate from the global control
			const currentRate = getSpeechRate()

			// Set voice properties
			utterance.rate = currentRate
			utterance.pitch = 1.0
			utterance.volume = 1.0

			// Find the best English voice
			const bestVoice = findBestEnglishVoice()
			if (bestVoice) {
				utterance.voice = bestVoice
				console.log(
					`Using voice: ${bestVoice.name} (${bestVoice.lang}) at rate: ${currentRate}`
				)
			} else {
				console.log('No suitable English voice found, using default voice')
			}

			// Set up event listeners
			utterance.onstart = () => {
				console.log('Speech started')
				setIsSpeaking(true)
			}

			utterance.onend = () => {
				console.log('Speech ended')
				setIsSpeaking(false)
			}

			utterance.onerror = e => {
				// Безопасный вывод информации об ошибке без прямого логирования объекта
				console.warn('Speech synthesis error occurred')

				// Сохраняем детали ошибки в более безопасном формате
				try {
					// В некоторых браузерах e.error содержит причину ошибки как строку
					if (e && typeof e === 'object' && 'error' in e) {
						const errorDetail = String(e.error)
						console.warn(`Error reason: ${errorDetail}`)

						// Прерванный синтез речи — это не настоящая ошибка, а ожидаемое поведение
						// при переключении или остановке
						if (errorDetail === 'interrupted') {
							console.log(
								'Speech was interrupted, which is normal when changing phrases'
							)
						}
					}
				} catch {
					console.warn('Unable to extract error details')
				}

				setIsSpeaking(false)

				// Пробуем воспроизвести еще раз через небольшую задержку, если ошибка произошла при первой попытке
				// и она не является прерыванием (interrupted)
				if (
					!window.speechSynthesisRetryAttempted &&
					!(
						e &&
						typeof e === 'object' &&
						'error' in e &&
						e.error === 'interrupted'
					)
				) {
					console.log('Retrying speech synthesis after error')
					window.speechSynthesisRetryAttempted = true
					setTimeout(() => {
						try {
							safelySpeakUtterance(utterance)
						} catch {
							console.warn('Retry attempt failed')
						}
					}, 500)
				} else {
					// Сбрасываем флаг после одной попытки повтора
					window.speechSynthesisRetryAttempted = false
				}
			}

			// Speak the text
			console.log('Initiating speech synthesis...')
			safelySpeakUtterance(utterance)
		} catch (e) {
			console.error('Error during speech synthesis:', e)
			setIsSpeaking(false)
		}
	}

	// Компонент для отображения баннера с предупреждением
	/**
	 * Компонент отображения предупреждения о недоступности озвучивания
	 * Показывает информативный баннер с иконкой предупреждения
	 * @returns JSX элемент с предупреждением
	 */
	const SpeechUnavailableWarning = () => (
		<div className='speech-warning-banner'>
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
				<span>Озвучивание не работает в вашем браузере</span>
			</div>
		</div>
	)

	// Base content that's rendered the same way on both server and client
	const baseContent = (
		<div className='audio-text-line'>
			<div className='line-container'>
				<div className='line-content'>
					{/* English text */}
					<span className='english-text'>{sections[0]}</span>

					{/* Phonetic transcription */}
					{sections[1] && (
						<>
							<span className='separator'> / </span>
							<span className='phonetic-text'>{sections[1]}</span>
						</>
					)}

					{/* Cyrillic transcription */}
					{sections[2] && (
						<>
							<span className='separator'> / </span>
							<span className='cyrillic-text'>{sections[2]}</span>
						</>
					)}

					{/* Russian translation */}
					{sections[3] && (
						<>
							<span className='separator'> / </span>
							<span className='russian-text'>{sections[3]}</span>
						</>
					)}
				</div>
			</div>
		</div>
	)

	// На сервере всегда рендерим только базовый контент
	if (!isClient) {
		return baseContent
	}

	// Рендер в зависимости от доступности озвучивания
	if (speechAvailable) {
		return (
			<div
				onClick={speakText}
				className={`audio-text-line-interactive ${
					isSpeaking ? 'speaking' : ''
				}`}
			>
				{baseContent}
			</div>
		)
	} else {
		return (
			<>
				{showWarning && (
					<div data-speech-warning='true'>
						<SpeechUnavailableWarning />
					</div>
				)}
				{baseContent}
			</>
		)
	}
}
