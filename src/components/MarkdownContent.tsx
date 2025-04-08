import React, { ReactNode } from 'react'
import AudioTextBlock from './AudioTextBlock'
import CollapsibleTranslation from './CollapsibleTranslation'
import './MarkdownContent.css'

interface MarkdownContentProps {
	content: string
	folder: string
	alias: string
}

// Types of text blocks we can identify
type TextBlockType = 'audio' | 'translation'

// Function to determine the type of a block
function determineBlockType(lines: string[], title?: string): TextBlockType {
	// Check if current block's title is "Перевод"
	if (title === 'Перевод') {
		return 'translation'
	}

	return 'audio'
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
		case 'audio':
			return (
				<AudioTextBlock
					key={key}
					content={content}
					sectionTitle={props.title}
				/>
			)
		case 'translation':
			return (
				<CollapsibleTranslation
					key={key}
					content={processMarkdownText(content)}
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
			// If we have content, save the current block
			if (currentBlock.length > 0) {
				blocks.push({
					content: [...currentBlock],
					title: currentTitle
				})
				currentBlock = []
			}

			// Extract title text
			const titleMatch = line.match(/^#+\s+(.+)$/)
			if (titleMatch) {
				currentTitle = titleMatch[1]
			}
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
				currentTitle = undefined
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

	// Extract the main title from the active section
	let pageTitle = ''
	const titleMatch = activeSection.match(/^#\s+(.+)$/m)
	if (titleMatch) {
		pageTitle = titleMatch[1]
	}

	// Parse the section into blocks
	const blocks = parseMarkdownToBlocks(activeSection)

	// Render all blocks
	return (
		<div className='markdown-content'>
			{/* Render lesson title at the top */}
			{pageTitle && <h1 className='lesson-title'>{pageTitle}</h1>}

			{/* Render all blocks with their content */}
			{blocks.map((block, blockIndex) => {
				const blockContent = block.content.join('\n')
				const blockType = determineBlockType(block.content, block.title)

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
