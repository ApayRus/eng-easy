'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSpeechRate } from './SpeechControls'
import './AudioTextLine.css'

interface AudioTextLineProps {
	text: string
}

// Улучшенная проверка доступности Speech API, включая проверку на Telegram браузер
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
	const [speechAvailable, setSpeechAvailable] = useState(true)
	const [isTelegramBrowser, setIsTelegramBrowser] = useState(false)

	// Split the text into sections
	const sections = text.split(' / ').map(section => section.trim())

	// Function to load and set available voices
	const loadVoices = useCallback(() => {
		if (!isSpeechSynthesisAvailable()) {
			setSpeechAvailable(false)
			return
		}

		try {
			const availableVoices = window.speechSynthesis.getVoices()
			if (availableVoices && availableVoices.length > 0) {
				setVoices(availableVoices)
				setSpeechAvailable(true)
			} else if (isClient) {
				// Запланируем повторную попытку, только если мы на клиенте
				setTimeout(loadVoices, 200)
			}
		} catch (e) {
			console.error('Error loading voices:', e)
			setSpeechAvailable(false)
		}
	}, [isClient])

	useEffect(() => {
		setIsClient(true)

		// Проверяем, открыты ли мы в Telegram браузере
		if (typeof window !== 'undefined') {
			const isTelegram =
				window.IS_TELEGRAM_WEBAPP === true ||
				navigator.userAgent.includes('Telegram') ||
				navigator.userAgent.includes('TelegramWebView')

			setIsTelegramBrowser(isTelegram)
		}

		// Проверяем доступность SpeechSynthesis API
		const available = isSpeechSynthesisAvailable()
		setSpeechAvailable(available)

		if (!available) return

		try {
			// Load voices initially
			loadVoices()

			// Set up event listener for voiceschanged
			window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

			// Clean up
			return () => {
				try {
					if (isSpeechSynthesisAvailable()) {
						window.speechSynthesis.removeEventListener(
							'voiceschanged',
							loadVoices
						)
					}
				} catch (e) {
					console.error('Error removing event listener:', e)
				}
			}
		} catch (e) {
			console.error('Error in speech synthesis setup:', e)
			setSpeechAvailable(false)
		}
	}, [loadVoices])

	// Function to find the best English voice
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

	const openInRegularBrowser = () => {
		// Добавляем визуальную индикацию перехода
		if (isTelegramBrowser) {
			// Добавляем класс анимации
			const lineElement = document.querySelector('.audio-text-line-interactive')
			if (lineElement) {
				lineElement.classList.add('loading-external')

				// Показываем сообщение о переходе
				const infoElement = document.querySelector(
					'.telegram-browser-info .info-text'
				)
				if (infoElement) {
					infoElement.textContent = 'Открываем во внешнем браузере...'
				}
			}
		}

		// Получаем текущий URL
		let currentUrl = window.location.href

		// Добавляем параметр external=true для автоматического открытия
		if (currentUrl.includes('?')) {
			currentUrl += '&external=true'
		} else {
			currentUrl += '?external=true'
		}

		// Создаем якорь для открытия в новом окне/вкладке
		const a = document.createElement('a')
		a.href = currentUrl
		a.target = '_blank'
		a.rel = 'noopener noreferrer'
		a.click()
	}

	const speakText = () => {
		// Если мы в Telegram, сначала проверяем, доступен ли Speech API
		if (isClient && isTelegramBrowser) {
			// Проверка доступности API в Telegram браузере
			if (!speechAvailable) {
				// API не доступен, предлагаем открыть в обычном браузере
				const infoMessage = document.querySelector('.telegram-browser-info')
				if (infoMessage) {
					infoMessage.classList.add('highlight-animation')
					setTimeout(() => {
						infoMessage.classList.remove('highlight-animation')
					}, 1000)
				}
				return
			}
			// Если API доступен, продолжаем работу как обычно
			console.log('Attempting to use Speech API in Telegram browser')
		}

		if (!isClient || !speechAvailable || !isSpeechSynthesisAvailable()) {
			if (isClient) {
				alert(
					'Функция озвучивания не поддерживается вашим браузером. Попробуйте открыть сайт в Chrome, Safari или Firefox.'
				)
			}
			return
		}

		try {
			// Stop any ongoing speech
			window.speechSynthesis.cancel()

			// Get the English text (first section)
			const englishText = sections[0]

			// Create a new speech synthesis utterance
			const utterance = new SpeechSynthesisUtterance(englishText)

			// Set language explicitly to English
			utterance.lang = 'en-US'

			// Get current speech rate from the global control
			const currentRate = getSpeechRate()

			// Set voice properties
			utterance.rate = currentRate // Используем установленную пользователем скорость
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
				console.log('No suitable English voice found')
			}

			// Set up event listeners
			utterance.onstart = () => setIsSpeaking(true)
			utterance.onend = () => setIsSpeaking(false)
			utterance.onerror = e => {
				console.error('Speech synthesis error:', e)
				setIsSpeaking(false)
			}

			// Speak the text
			window.speechSynthesis.speak(utterance)
		} catch (e) {
			console.error('Error during speech synthesis:', e)
			if (isClient) {
				alert(
					'Не удалось запустить озвучивание. Возможно, ваш браузер не поддерживает эту функцию.'
				)
			}
		}
	}

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

	// Иконка внешнего браузера (для Telegram)
	const ExternalBrowserButton = () => (
		<button
			onClick={openInRegularBrowser}
			className='external-browser-button'
			aria-label='Открыть в браузере'
			title='Открыть в обычном браузере для лучшей поддержки озвучивания'
		>
			<svg
				viewBox='0 0 24 24'
				width='16'
				height='16'
				stroke='currentColor'
				strokeWidth='2'
				fill='none'
			>
				<path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'></path>
				<polyline points='15 3 21 3 21 9'></polyline>
				<line x1='10' y1='14' x2='21' y2='3'></line>
			</svg>
		</button>
	)

	// On the server and initial client render, return the base content
	if (!isClient) {
		return baseContent
	}

	// Если мы в Telegram браузере, показываем специальный UI
	if (isTelegramBrowser) {
		// Если Speech API доступен в Telegram, показываем обычный UI с дополнительной информацией
		if (speechAvailable) {
			return (
				<>
					<div className='audio-text-line-container telegram-browser'>
						<div
							onClick={speakText}
							className={`audio-text-line-interactive ${
								isSpeaking ? 'speaking' : ''
							}`}
						>
							{baseContent}
						</div>

						<div className='telegram-browser-info success'>
							<div className='info-text'>
								Озвучивание доступно в вашем Telegram браузере!
							</div>
						</div>
					</div>
				</>
			)
		}

		// Если Speech API не доступен, показываем UI с предложением открыть во внешнем браузере
		return (
			<>
				<div className='audio-text-line-container telegram-browser'>
					<div
						onClick={openInRegularBrowser}
						className='audio-text-line-interactive'
						title='Нажмите, чтобы открыть во внешнем браузере с поддержкой озвучивания'
					>
						{baseContent}
					</div>

					<div className='telegram-browser-info'>
						<div className='info-text'>
							Для озвучивания откройте в обычном браузере
						</div>
						<ExternalBrowserButton />
					</div>
				</div>
			</>
		)
	}

	// На клиенте после гидратации оборачиваем контент интерактивными элементами
	return (
		<>
			<div
				onClick={speakText}
				className={`audio-text-line-interactive ${
					isSpeaking ? 'speaking' : ''
				}`}
			>
				{baseContent}
			</div>
			{isClient && !speechAvailable && !isTelegramBrowser && (
				<div className='speech-unavailable-message'>
					Функция озвучивания недоступна в вашем браузере. Попробуйте открыть в
					Chrome, Safari или Firefox.
				</div>
			)}
		</>
	)
}
