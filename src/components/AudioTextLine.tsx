/**
 * Компонент AudioTextLine - отображает строку текста с возможностью озвучивания
 * Реализует надежное обнаружение и использование Web Speech API
 * с учетом особенностей работы в различных браузерах, включая Telegram WebView
 */
'use client'

import { useEffect, useState } from 'react'
import { getSpeechRate, getCurrentVoice } from './SpeechControls'
import './AudioTextLine.css'

interface AudioTextLineProps {
	text: string
}

/**
 * Проверяет доступность Speech API
 * Учитывает особенности Telegram WebView и других браузерах
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
	const [speechAvailable, setSpeechAvailable] = useState(false) // Изначально false для SSR

	// Split the text into sections
	const sections = text.split(' / ').map(section => section.trim())

	// Инициализация клиентского состояния и проверка Speech API
	useEffect(() => {
		setIsClient(true)

		// Всю работу с браузерным API делаем только на клиенте
		if (typeof window !== 'undefined') {
			// Проверяем доступность API
			const available = isSpeechSynthesisAvailable()
			setSpeechAvailable(available)
		}
	}, [])

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

	const speakText = () => {
		if (!speechAvailable) {
			console.warn('Speech synthesis not available')
			return
		}

		// Останавливаем текущее воспроизведение
		window.speechSynthesis.cancel()

		// Создаем utterance только для английского текста (первая секция)
		const utterance = new SpeechSynthesisUtterance(sections[0])

		// Используем выбранный голос или голос по умолчанию
		const selectedVoice = getCurrentVoice()
		if (selectedVoice) {
			utterance.voice = selectedVoice
		}

		// Устанавливаем скорость воспроизведения
		utterance.rate = getSpeechRate()

		// Устанавливаем обработчики событий
		utterance.onstart = () => setIsSpeaking(true)
		utterance.onend = () => setIsSpeaking(false)
		utterance.onerror = () => setIsSpeaking(false)

		// Запускаем воспроизведение
		safelySpeakUtterance(utterance)
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

	// На сервере всегда рендерим только базовый контент
	if (!isClient) {
		return baseContent
	}

	// Рендер в зависимости от доступности озвучивания
	return (
		<div
			onClick={speakText}
			className={`audio-text-line-interactive ${isSpeaking ? 'speaking' : ''}`}
		>
			{baseContent}
		</div>
	)
}
