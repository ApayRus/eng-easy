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
	// Split the content into lines, preserving empty lines
	const englishLines = content.split('\n')

	// Group lines into paragraphs (sections separated by empty lines)
	const paragraphs: string[][] = []
	let currentParagraph: string[] = []

	englishLines.forEach(line => {
		if (line.trim() === '') {
			if (currentParagraph.length > 0) {
				paragraphs.push([...currentParagraph])
				currentParagraph = []
			}
		} else {
			currentParagraph.push(line)
		}
	})

	// Add the last paragraph if not empty
	if (currentParagraph.length > 0) {
		paragraphs.push(currentParagraph)
	}

	return (
		<div className='audio-text-block'>
			{sectionTitle && <h3 className='section-title'>{sectionTitle}</h3>}

			<div className='english-lines'>
				{/* Render paragraphs with lines */}
				{paragraphs.map((paragraph, pIndex) => (
					<div key={`para-${pIndex}`} className='paragraph-block'>
						{paragraph.map((line, lIndex) => (
							<div key={`line-${pIndex}-${lIndex}`} className='sentence-block'>
								<AudioTextLine text={line} />
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	)
}
