'use client'

import React from 'react'
import { marked } from 'marked'
import './MarkdownContent.css' // Используем те же стили

interface InfoContentProps {
	content: string
}

export default function InfoContent({ content }: InfoContentProps) {
	// Преобразуем markdown в HTML
	const htmlContent = marked.parse(content)

	return (
		<div
			className='markdown-content info-content'
			dangerouslySetInnerHTML={{ __html: htmlContent }}
		/>
	)
}
