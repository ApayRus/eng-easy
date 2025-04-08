'use client'

import React, { useState, useEffect } from 'react'
import styles from './VoiceSelector.module.css'

interface VoiceSelectorProps {
	onVoiceSelect: (voice: SpeechSynthesisVoice) => void
	currentVoice: SpeechSynthesisVoice | null
}

export default function VoiceSelector({
	onVoiceSelect,
	currentVoice
}: VoiceSelectorProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// Function to load voices
		const loadVoices = () => {
			const availableVoices = window.speechSynthesis.getVoices()
			const englishVoices = availableVoices.filter(
				voice => voice.lang.startsWith('en') || voice.lang.startsWith('en-')
			)
			setVoices(englishVoices)
			setIsLoading(false)
		}

		// Load voices immediately if available
		loadVoices()

		// Listen for voiceschanged event
		window.speechSynthesis.addEventListener('voiceschanged', loadVoices)

		return () => {
			window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
		}
	}, [])

	const toggleDropdown = () => {
		setIsOpen(!isOpen)
	}

	const handleVoiceSelect = (voice: SpeechSynthesisVoice) => {
		onVoiceSelect(voice)
		setIsOpen(false)
	}

	return (
		<div className={styles.voiceSelector}>
			<button className={styles.voiceButton} onClick={toggleDropdown}>
				Голос
				<span className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
			</button>

			{isOpen && (
				<div className={styles.dropdown}>
					{isLoading ? (
						<div className={styles.loading}>Загрузка голосов...</div>
					) : voices.length === 0 ? (
						<div className={styles.noVoices}>Нет доступных голосов</div>
					) : (
						voices.map(voice => (
							<button
								key={voice.name}
								className={`${styles.voiceOption} ${
									currentVoice === voice ? styles.selected : ''
								}`}
								onClick={() => handleVoiceSelect(voice)}
							>
								{voice.name}
							</button>
						))
					)}
				</div>
			)}
		</div>
	)
}
