'use client'

import AudioTextLine from './AudioTextLine'
import { useState } from 'react'

interface AudioTextBlockProps {
	content: string
	sectionTitle?: string
	hideTitle?: boolean
	russianContent?: string
}

export default function AudioTextBlock({
	content,
	sectionTitle,
	hideTitle = false,
	russianContent
}: AudioTextBlockProps) {
	const [showTranslations, setShowTranslations] = useState(false)

	// Split the content into lines and filter out empty lines
	const englishLines = content.split('\n').filter(line => line.trim() !== '')

	// Split the Russian content into lines and filter out empty lines
	const russianLines =
		russianContent?.split('\n').filter(line => line.trim() !== '') || []

	// Check if we have any Russian translations
	const hasTranslations = russianLines.length > 0

	return (
		<div className='audio-text-block'>
			{sectionTitle && !hideTitle && (
				<h3 className='section-title'>{sectionTitle}</h3>
			)}

			<div className='english-lines'>
				{/* Render the English lines */}
				{englishLines.map((line, index) => (
					<div key={`en-${index}`} className='sentence-block'>
						<AudioTextLine text={line} />
					</div>
				))}
			</div>

			{/* Translations toggle button */}
			{hasTranslations && (
				<div className='translations-wrapper'>
					<button
						className='translations-toggle'
						onClick={() => setShowTranslations(!showTranslations)}
					>
						{showTranslations ? 'Скрыть переводы' : 'Показать переводы'}
						<span
							className={`chevron-icon ${showTranslations ? 'expanded' : ''}`}
						>
							{showTranslations ? '▲' : '▼'}
						</span>
					</button>

					{/* Translations content */}
					{showTranslations && (
						<div className='translations-content'>
							{russianLines.map((line, index) => (
								<div key={`ru-${index}`} className='translation-line'>
									<p className='russian-line'>{line}</p>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	)
}
