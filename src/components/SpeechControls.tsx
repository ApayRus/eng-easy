'use client'

import { useState, useEffect } from 'react'
import './SpeechControls.css'

// Создаем глобальную переменную для хранения скорости речи
// Таким образом, значение будет доступно для всех компонентов
let globalSpeechRate = 1.0

// Экспортируем функцию для получения текущей скорости речи
export function getSpeechRate(): number {
	return globalSpeechRate
}

export default function SpeechControls() {
	const [speechRate, setSpeechRate] = useState(1.0)
	const [isClient, setIsClient] = useState(false)

	useEffect(() => {
		setIsClient(true)
		// Проверяем, есть ли сохраненное значение в localStorage
		const savedRate = localStorage.getItem('speechRate')
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
		localStorage.setItem('speechRate', newRate.toString())
	}

	if (!isClient) {
		return null // Не рендерим на сервере
	}

	return (
		<div className='speech-controls'>
			<div className='speech-rate-wrapper'>
				<div className='speech-rate-label'>Скорость</div>
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
					<div className='speech-rate-value'>{speechRate.toFixed(1)}</div>
				</div>
			</div>
		</div>
	)
}
