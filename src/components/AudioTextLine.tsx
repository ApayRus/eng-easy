'use client'

import { useEffect, useState } from 'react'
import './AudioTextLine.css'

interface AudioTextLineProps {
	text: string
}

export default function AudioTextLine({ text }: AudioTextLineProps) {
	const [isClient, setIsClient] = useState(false)
	const [isSpeaking, setIsSpeaking] = useState(false)

	useEffect(() => {
		setIsClient(true)
	}, [])

	// Split the text into sections
	const sections = text.split(' / ').map(section => section.trim())

	const speakText = () => {
		if (!isClient) return

		// Stop any ongoing speech
		window.speechSynthesis.cancel()

		// Get the English text (first section)
		const englishText = sections[0]

		// Create a new speech synthesis utterance
		const utterance = new SpeechSynthesisUtterance(englishText)

		// Set voice properties
		utterance.rate = 1.0
		utterance.pitch = 1.0
		utterance.volume = 1.0

		// Try to find a female English voice
		const voices = window.speechSynthesis.getVoices()
		const englishVoice = voices.find(
			voice => voice.lang.includes('en') && voice.name.includes('Female')
		)

		if (englishVoice) {
			utterance.voice = englishVoice
		}

		// Set up event listeners
		utterance.onstart = () => setIsSpeaking(true)
		utterance.onend = () => setIsSpeaking(false)
		utterance.onerror = () => setIsSpeaking(false)

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
