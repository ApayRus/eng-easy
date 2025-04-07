'use client'

import './page.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Проверка доступности браузерного API
const isBrowser = () => typeof window !== 'undefined'

// Безопасная функция для работы с localStorage
const safeLocalStorage = {
	getItem: (key: string): string | null => {
		if (isBrowser()) {
			try {
				return localStorage.getItem(key)
			} catch (e) {
				console.error('Error accessing localStorage:', e)
				return null
			}
		}
		return null
	}
}

// Helper function to get user's preferred language
function getUserPreferredLanguage(): string[] {
	// Default to English if not in browser
	if (!isBrowser()) {
		return ['en']
	}

	// Check localStorage first (user's explicit choice)
	const storedLang = safeLocalStorage.getItem('preferredLanguage')
	if (storedLang) {
		return [storedLang, 'en'] // Preferred language, then English as fallback
	}

	// Get browser language
	try {
		let browserLang = navigator.language || 'en'
		browserLang = browserLang.split('-')[0] // e.g., 'en-US' -> 'en'
		return [browserLang, 'en'] // Browser language, then English as fallback
	} catch (e) {
		console.error('Error accessing navigator:', e)
		return ['en']
	}
}

// Define types for our content items
interface ContentItem {
	slug: string
	alias: string
	title: string
}

export default function Home() {
	const [infoFolders, setInfoFolders] = useState<ContentItem[]>([])
	const [lessonsWithTitles, setLessonsWithTitles] = useState<ContentItem[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function loadContent() {
			try {
				// Get user's preferred language
				const preferredLanguages = getUserPreferredLanguage()

				// Fetch content from our API route
				const response = await fetch(
					`/api/content?languages=${preferredLanguages.join(',')}`
				)

				if (!response.ok) {
					throw new Error('Failed to fetch content')
				}

				const data = await response.json()

				setInfoFolders(data.info)
				setLessonsWithTitles(data.lessons)
			} catch (error) {
				console.error('Error loading content:', error)
			} finally {
				setIsLoading(false)
			}
		}

		loadContent()
	}, [])

	if (isLoading) {
		return <div className='home-page loading'>Loading...</div>
	}

	return (
		<div className='home-page'>
			<h1 className='home-title'>
				<span className='letter-E'>E</span>
				<span className='letter-n'>n</span>
				<span className='letter-g'>g</span>
				<span className='letter-E2'>E</span>
				<span className='letter-a'>a</span>
				<span className='letter-s'>s</span>
				<span className='letter-y'>y</span>
			</h1>

			<div className='content-column'>
				{/* Info Pages Section */}
				{infoFolders.length > 0 && (
					<div className='content-section'>
						<h2 className='section-title'>Информация</h2>
						<div className='lessons-list'>
							{infoFolders.map(page => (
								<div key={page.slug} className='lesson-item'>
									<Link href={`/info/${page.alias}`} className='lesson-link'>
										{page.title}
									</Link>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Lessons Section */}
				<div className='content-section'>
					<h2 className='section-title'>Уроки</h2>
					<div className='lessons-list'>
						{lessonsWithTitles.map(lesson => (
							<div key={lesson.slug} className='lesson-item'>
								<Link href={`/lessons/${lesson.alias}`} className='lesson-link'>
									{lesson.title}
								</Link>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
