'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSpeechRate } from './SpeechControls'
import './AudioTextLine.css'

interface AudioTextLineProps {
	text: string
}

// Проверка доступности Speech API
const isSpeechSynthesisAvailable = () => {
	return (
		typeof window !== 'undefined' &&
		'speechSynthesis' in window &&
		'SpeechSynthesisUtterance' in window
	)
}

export default function AudioTextLine({ text }: AudioTextLineProps) {
	const [isClient, setIsClient] = useState(false)
	const [isSpeaking, setIsSpeaking] = useState(false)
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

	// Split the text into sections
	const sections = text.split(' / ').map(section => section.trim())

	// Function to load and set available voices
	const loadVoices = useCallback(() => {
		if (!isSpeechSynthesisAvailable()) return

		const availableVoices = window.speechSynthesis.getVoices()
		if (availableVoices.length > 0) {
			setVoices(availableVoices)
		}
	}, [])

	useEffect(() => {
		setIsClient(true)

		// Проверяем доступность SpeechSynthesis API
		if (!isSpeechSynthesisAvailable()) return

		// Load voices initially
		loadVoices()

		// Set up event listener for voiceschanged
		window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

		// Clean up
		return () => {
			if (isSpeechSynthesisAvailable()) {
				window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
			}
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
		const anyEnglishVoice = voices.find(voice => voice.lang.startsWith('en'))
		if (anyEnglishVoice) return anyEnglishVoice

		// Fallback: Just return the first voice
		return voices[0]
	}, [voices])

	const speakText = () => {
		if (!isClient || !isSpeechSynthesisAvailable()) return

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

	// On the server and initial client render, return the base content
	if (!isClient) {
		return baseContent
	}

	// On the client after hydration, wrap the content with interactive elements
	return (
		<div
			onClick={speakText}
			className={`audio-text-line-interactive ${isSpeaking ? 'speaking' : ''}`}
		>
			{baseContent}
		</div>
	)
}
