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

	// Check if it's an audio block - improved detection
	if (
		// Multiple lines with sentence structure
		(lines.length > 1 &&
			lines.every(line => {
				const trimmedLine = line.trim()
				return (
					trimmedLine === '' || // Allow empty lines
					// Sentence format: starts with capital letter
					/^[A-Z]/.test(trimmedLine)
				)
			})) ||
		// Format with slashes detection
		lines.some(line => {
			const trimmedLine = line.trim()
			return (trimmedLine.match(/\s\/\s/g) || []).length >= 2
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
					{content.split('\n').map((line, index) => (
						<p key={`${key}-${index}`} className='mb-2'>
							{line.replace(/^>\s*/, '')}
						</p>
					))}
				</blockquote>
			)
		default:
			return (
				<p
					key={key}
					className='paragraph my-4'
					dangerouslySetInnerHTML={{ __html: processMarkdownText(content) }}
				/>
			)
	}
}

// Структура для блоков с информацией о заголовках
interface ContentBlock {
	content: string[]
	title?: string
}

// Parse markdown content into blocks with titles
function parseMarkdownToBlocks(content: string): ContentBlock[] {
	const lines = content.split('\n')
	const blocks: ContentBlock[] = []
	let currentBlock: string[] = []
	let currentTitle: string | undefined = undefined

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trimEnd()

		// Start a new block if this is a heading
		if (line.startsWith('#')) {
			if (currentBlock.length > 0) {
				blocks.push({
					content: [...currentBlock],
					title: currentTitle
				})
				currentBlock = []
			}

			// Extract title text
			const titleMatch = line.match(/^#+\s+(.+)$/)
			currentTitle = titleMatch ? titleMatch[1] : undefined
			continue
		}

		// Empty line means end of the current block
		if (line.trim() === '') {
			if (currentBlock.length > 0) {
				blocks.push({
					content: [...currentBlock],
					title: currentTitle
				})
				currentBlock = []
			}
			continue
		}

		// Otherwise add to the current block
		currentBlock.push(line)
	}

	// Add the last block if it's not empty
	if (currentBlock.length > 0) {
		blocks.push({
			content: [...currentBlock],
			title: currentTitle
		})
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

	// Process only the English section (before the divider)
	const activeSection = sections[0]

	// Parse the section into blocks
	const blocks = parseMarkdownToBlocks(activeSection)

	// Render all blocks
	return (
		<div className='markdown-content'>
			{blocks.map((block, blockIndex) => {
				const blockContent = block.content.join('\n')
				const blockType = determineBlockType(block.content)
				return (
					<React.Fragment key={`block-${blockIndex}`}>
						{renderBlock(blockContent, blockType, {
							folder,
							alias,
							title: block.title
						})}
					</React.Fragment>
				)
			})}
		</div>
	)
}
