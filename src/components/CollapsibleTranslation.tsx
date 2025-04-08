'use client'

import React, { useState } from 'react'
import styles from './CollapsibleTranslation.module.css'

interface CollapsibleTranslationProps {
	content: string
}

export default function CollapsibleTranslation({
	content
}: CollapsibleTranslationProps) {
	const [isExpanded, setIsExpanded] = useState(false)

	// Function to format content and highlight text after the slash
	const formatContent = (text: string) => {
		// Split the text by lines
		const lines = text.split('\n')

		return lines
			.map(line => {
				// Split each line by the forward slash
				if (line.includes(' / ')) {
					const [beforeSlash, afterSlash] = line.split(' / ', 2)

					// Return the formatted HTML with different classes
					return `<span class="${styles.translationPrimary}">${beforeSlash}</span> / <span class="${styles.translationSecondary}">${afterSlash}</span>`
				}

				// Return the line unchanged if no slash
				return line
			})
			.join('\n')
	}

	return (
		<div className={styles.translationBlock}>
			{!isExpanded ? (
				<button
					onClick={() => setIsExpanded(true)}
					className={styles.translationButton}
				>
					<span>Перевод</span>
					<svg
						className={styles.translationChevron}
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M19 9l-7 7-7-7'
						/>
					</svg>
				</button>
			) : (
				<div>
					<button
						onClick={() => setIsExpanded(false)}
						className={styles.translationButton}
					>
						<span>Скрыть перевод</span>
						<svg
							className={styles.translationChevron}
							style={{ transform: 'rotate(180deg)' }}
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M19 9l-7 7-7-7'
							/>
						</svg>
					</button>
					<div
						className={styles.translationContent}
						dangerouslySetInnerHTML={{ __html: formatContent(content) }}
					/>
				</div>
			)}
		</div>
	)
}
