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
						dangerouslySetInnerHTML={{ __html: content }}
					/>
				</div>
			)}
		</div>
	)
}
