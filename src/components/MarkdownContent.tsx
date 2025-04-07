import React, { ReactNode } from 'react'
import AudioTextBlock from './AudioTextBlock'
import './MarkdownContent.css'

interface MarkdownContentProps {
	content: string
	folder: string
	alias: string
}

// Types of text blocks we can identify
type TextBlockType =
	| 'audio'
	| 'list'
	| 'paragraph'
	| 'heading'
	| 'code'
	| 'quote'

// Function to determine the type of a text block
function determineBlockType(lines: string[]): TextBlockType {
	// If it's empty, it's a paragraph
	if (lines.length === 0) {
		return 'paragraph'
	}

	// Check if it's a heading
	if (lines[0].trim().startsWith('#')) {
		return 'heading'
	}

	// Check if it's a code block
	if (lines.some(line => line.trim().startsWith('```'))) {
		return 'code'
	}

	// Check if it's a list
	if (lines.some(line => /^[\s-]*[-*+]\s/.test(line))) {
		return 'list'
	}

	// Check if it's a quote
	if (lines.some(line => line.trim().startsWith('>'))) {
		return 'quote'
	}

	// Check if it's an audio block
	if (
		lines.some(line => {
			const trimmedLine = line.trim()
			return (
				// Format with slashes (English / Phonetic / Cyrillic / Russian)
				(trimmedLine.match(/\s\/\s/g) || []).length >= 2 ||
				// Simple sentence format (starts with capital, ends with punctuation)
				/^[A-Z][^.!?]*( [^.!?]*)*[.!?]?$/.test(trimmedLine)
			)
		})
	) {
		return 'audio'
	}

	// Default to paragraph
	return 'paragraph'
}

// Process markdown content to handle formatting
function processMarkdownText(text: string): string {
	// Process bold (**text**)
	text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

	// Process italic (*text*)
	text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')

	// Process links [text](url)
	text = text.replace(
		/\[(.*?)\]\((.*?)\)/g,
		'<a href="$2" class="text-blue-600 hover:underline">$1</a>'
	)

	return text
}

// Function to render different types of blocks
function renderBlock(
	content: string,
	type: TextBlockType,
	props: {
		folder: string
		alias: string
		title?: string
		russianContent?: string
	}
): ReactNode {
	const key = `${type}-${content.substring(0, 20).replace(/\s+/g, '-')}`

	switch (type) {
		case 'heading':
			const headingMatch = content.match(/^(#+)\s+(.+)$/m)
			if (headingMatch) {
				const level = headingMatch[1].length
				const text = headingMatch[2]

				if (level === 1) {
					return (
						<h1 key={key} className='heading-1 mb-4'>
							{text}
						</h1>
					)
				} else if (level === 2) {
					return (
						<h2 key={key} className='heading-2 mb-4'>
							{text}
						</h2>
					)
				} else if (level === 3) {
					return (
						<h3 key={key} className='heading-3 mb-4'>
							{text}
						</h3>
					)
				} else if (level === 4) {
					return (
						<h4 key={key} className='heading-4 mb-4'>
							{text}
						</h4>
					)
				} else if (level === 5) {
					return (
						<h5 key={key} className='heading-5 mb-4'>
							{text}
						</h5>
					)
				} else {
					return (
						<h6 key={key} className='heading-6 mb-4'>
							{text}
						</h6>
					)
				}
			}
			return null
		case 'audio':
			return (
				<AudioTextBlock
					key={key}
					content={content}
					sectionTitle={props.title}
					hideTitle={true}
					russianContent={props.russianContent}
				/>
			)
		case 'list':
			return (
				<ul key={key} className='list-disc pl-6 my-4'>
					{content.split('\n').map((item, index) => {
						if (!item.trim()) return null
						const processedItem = processMarkdownText(
							item.replace(/^[\s-]*[-*+]\s/, '')
						)
						return (
							<li
								key={`${key}-${index}`}
								className='mb-2'
								dangerouslySetInnerHTML={{ __html: processedItem }}
							/>
						)
					})}
				</ul>
			)
		case 'code':
			return (
				<pre
					key={key}
					className='bg-gray-100 p-4 rounded-md overflow-x-auto my-4'
				>
					<code>{content.replace(/```.*\n/, '').replace(/```$/, '')}</code>
				</pre>
			)
		case 'quote':
			return (
				<blockquote
					key={key}
					className='border-l-4 border-gray-300 pl-4 italic my-4'
				>
					{content.split('\n').map((line, index) => {
						if (!line.trim()) return null
						const processedLine = processMarkdownText(line.replace(/^>\s*/, ''))
						return (
							<p
								key={`${key}-${index}`}
								dangerouslySetInnerHTML={{ __html: processedLine }}
							/>
						)
					})}
				</blockquote>
			)
		case 'paragraph':
			const processedContent = processMarkdownText(content)
			return (
				<p
					key={key}
					className='my-4'
					dangerouslySetInnerHTML={{ __html: processedContent }}
				/>
			)
		default:
			return (
				<p key={key} className='my-4'>
					{content}
				</p>
			)
	}
}

// Parse markdown content into blocks
function parseMarkdownToBlocks(content: string): string[][] {
	const lines = content.split('\n')
	const blocks: string[][] = []
	let currentBlock: string[] = []

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trimEnd()

		// Start a new block if this is a heading
		if (line.startsWith('#')) {
			if (currentBlock.length > 0) {
				blocks.push([...currentBlock])
				currentBlock = []
			}
			currentBlock.push(line)
			blocks.push([...currentBlock])
			currentBlock = []
			continue
		}

		// Empty line means end of the current block
		if (line.trim() === '') {
			if (currentBlock.length > 0) {
				blocks.push([...currentBlock])
				currentBlock = []
			}
			continue
		}

		// Otherwise add to the current block
		currentBlock.push(line)
	}

	// Add the last block if it's not empty
	if (currentBlock.length > 0) {
		blocks.push(currentBlock)
	}

	return blocks
}

// Main component for rendering markdown content
export default function MarkdownContent({
	content,
	folder,
	alias
}: MarkdownContentProps) {
	// Split the content into sections by horizontal rules
	const sections = content
		.split(/^---$/m)
		.filter(section => section.trim() !== '')

	// Special case for lessons with English/Russian sections
	if (sections.length === 2 && folder === 'lessons') {
		const englishSection = sections[0]
		const russianSection = sections[1]

		// Parse English section into blocks
		const blocks = parseMarkdownToBlocks(englishSection)

		return (
			<div className='markdown-content'>
				{blocks.map((block, blockIndex) => {
					const blockContent = block.join('\n')
					const blockType = determineBlockType(block)

					// If this is an audio block, pass the Russian content
					if (blockType === 'audio') {
						// Find the next heading to use as a title
						let title = ''
						for (let i = blockIndex - 1; i >= 0; i--) {
							const prevBlock = blocks[i]
							if (prevBlock.length > 0 && prevBlock[0].startsWith('#')) {
								title = prevBlock[0].replace(/^#+\s+/, '')
								break
							}
						}

						return (
							<AudioTextBlock
								key={`audio-block-${blockIndex}`}
								content={blockContent}
								sectionTitle={title}
								russianContent={russianSection}
							/>
						)
					}

					// Otherwise, render normally
					return renderBlock(blockContent, blockType, { folder, alias })
				})}
			</div>
		)
	}

	// Default rendering for other content
	return (
		<div className='markdown-content'>
			{sections.map((section, sectionIndex) => {
				// Parse the section into blocks
				const blocks = parseMarkdownToBlocks(section)

				// Render each block
				return (
					<div key={`section-${sectionIndex}`} className='mb-8'>
						{blocks.map(block => {
							const blockContent = block.join('\n')
							const blockType = determineBlockType(block)
							return renderBlock(blockContent, blockType, { folder, alias })
						})}
					</div>
				)
			})}
		</div>
	)
}
