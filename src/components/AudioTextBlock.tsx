'use client'

import AudioTextLine from './AudioTextLine'

interface AudioTextBlockProps {
	content: string
	sectionTitle?: string
}

export default function AudioTextBlock({
	content,
	sectionTitle
}: AudioTextBlockProps) {
	// Split the content into lines and filter out empty lines
	const englishLines = content.split('\n').filter(line => line.trim() !== '')

	return (
		<div className='audio-text-block'>
			{sectionTitle && <h3 className='section-title'>{sectionTitle}</h3>}

			<div className='english-lines'>
				{/* Render the English lines */}
				{englishLines.map((line, index) => (
					<div key={`en-${index}`} className='sentence-block'>
						<AudioTextLine text={line} />
					</div>
				))}
			</div>
		</div>
	)
}
