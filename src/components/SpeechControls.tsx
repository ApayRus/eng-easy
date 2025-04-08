'use client'

import { useState, useEffect } from 'react'
import VoiceSelector from './VoiceSelector'
import './SpeechControls.css'

// Проверка доступности браузерного API
const isBrowser = () => typeof window !== 'undefined'

// Проверка доступности Web Speech API
const isSpeechSynthesisAvailable = () => {
	try {
		return (
			isBrowser() &&
			'speechSynthesis' in window &&
			'SpeechSynthesisUtterance' in window &&
			typeof window.speechSynthesis.getVoices === 'function'
		)
	} catch (e) {
		console.error('Error checking speech synthesis:', e)
		return false
	}
}

// Создаем глобальные переменные для хранения скорости речи и голоса
let globalSpeechRate = 1.0
let globalVoice: SpeechSynthesisVoice | null = null

// Безопасная функция для работы с localStorage
const safeLocalStorage = {
	getItem: (key: string): string | null => {
		if (isBrowser()) {
			try {
				return localStorage.getItem(key)
			} catch (e) {
				console.error('Error accessing localStorage:', e)
				return null
			}
		}
		return null
	},
	setItem: (key: string, value: string): void => {
		if (isBrowser()) {
			try {
				localStorage.setItem(key, value)
			} catch (e) {
				console.error('Error setting localStorage:', e)
			}
		}
	}
}

// Экспортируем функции для получения текущей скорости речи и голоса
export function getSpeechRate(): number {
	return globalSpeechRate
}

export function getCurrentVoice(): SpeechSynthesisVoice | null {
	return globalVoice
}

export default function SpeechControls() {
	const [speechRate, setSpeechRate] = useState(1.0)
	const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(
		null
	)
	const [isClient, setIsClient] = useState(false)
	const [isSpeechAvailable, setIsSpeechAvailable] = useState(true)

	useEffect(() => {
		setIsClient(true)

		// Проверяем доступность Speech API
		setIsSpeechAvailable(isSpeechSynthesisAvailable())

		// Проверяем, есть ли сохраненное значение в localStorage
		const savedRate = safeLocalStorage.getItem('speechRate')
		if (savedRate) {
			const rate = parseFloat(savedRate)
			setSpeechRate(rate)
			globalSpeechRate = rate
		}
	}, [])

	const handleRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newRate = parseFloat(event.target.value)
		setSpeechRate(newRate)
		// Обновляем глобальную переменную
		globalSpeechRate = newRate
		// Сохраняем в localStorage для персистентности
		safeLocalStorage.setItem('speechRate', newRate.toString())
	}

	const handleVoiceSelect = (voice: SpeechSynthesisVoice) => {
		setCurrentVoice(voice)
		globalVoice = voice
		// Сохраняем выбранный голос
		safeLocalStorage.setItem('selectedVoice', voice.name)
	}

	if (!isClient || !isSpeechAvailable) {
		return null // Не рендерим на сервере или если API недоступен
	}

	return (
		<div className='speech-controls'>
			<VoiceSelector
				currentVoice={currentVoice}
				onVoiceSelect={handleVoiceSelect}
			/>
			<div className='speech-rate-wrapper'>
				<div className='speech-rate-control'>
					<input
						type='range'
						id='speech-rate'
						min='0.1'
						max='1'
						step='0.1'
						value={speechRate}
						onChange={handleRateChange}
					/>
					<div className='speech-rate-value'>x{speechRate.toFixed(1)}</div>
				</div>
			</div>
		</div>
	)
}
