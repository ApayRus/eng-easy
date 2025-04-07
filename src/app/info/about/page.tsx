'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import InfoContent from '@/components/InfoContent'
import './about.css'

// This function runs on the client
async function getMarkdownContent(lang: string) {
	try {
		// We're doing this on the client side, so we need to fetch the content
		const response = await fetch(`/api/content/info?lang=${lang}&page=about`)
		if (!response.ok) {
			throw new Error('Failed to fetch content')
		}
		return await response.json()
	} catch (error) {
		console.error('Error fetching content:', error)
		return null
	}
}

// Helper function to get user's preferred language
function getUserPreferredLanguage(): string {
	// Check if in browser environment
	if (typeof window === 'undefined') {
		return 'en'
	}

	// Check localStorage first (user's explicit choice)
	const storedLang = localStorage.getItem('preferredLanguage')
	if (storedLang) {
		return storedLang
	}

	// Then check browser language
	let browserLang = navigator.language || 'en'

	// Extract the language code (e.g., 'en-US' -> 'en')
	browserLang = browserLang.split('-')[0]

	// Store this for future reference
	localStorage.setItem('preferredLanguage', browserLang)

	return browserLang
}

// Flag component for language selection
function FlagButton({
	lang,
	currentLang,
	onClick
}: {
	lang: string
	currentLang: string
	onClick: () => void
}) {
	// Display flag for the language
	const flagEmoji = lang === 'en' ? '🇬🇧' : '🇷🇺'
	const isActive = lang === currentLang

	return (
		<button
			onClick={onClick}
			className={`flag-button ${isActive ? 'active' : ''}`}
			title={lang === 'en' ? 'English' : 'Русский'}
			aria-label={
				lang === 'en' ? 'Switch to English' : 'Переключить на русский'
			}
		>
			<span className='flag-emoji'>{flagEmoji}</span>
		</button>
	)
}

// Available languages
const languages = [
	{ code: 'en', emoji: '🇬🇧', name: 'English' },
	{ code: 'ru', emoji: '🇷🇺', name: 'Русский' }
	// Add more languages here in the future
]

export default function AboutPage() {
	const [content, setContent] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [language, setLanguage] = useState('en')
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Load content in preferred language
	useEffect(() => {
		async function loadContent() {
			setIsLoading(true)
			const preferredLang = getUserPreferredLanguage()
			setLanguage(preferredLang)

			const data = await getMarkdownContent(preferredLang)
			setContent(data?.content || null)
			setIsLoading(false)
		}

		loadContent()

		// Close dropdown when clicking outside
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	// Switch language handler
	const switchLanguage = async (lang: string) => {
		if (lang === language) {
			setIsDropdownOpen(false)
			return
		}

		setIsLoading(true)
		setIsDropdownOpen(false)
		localStorage.setItem('preferredLanguage', lang)
		setLanguage(lang)

		const data = await getMarkdownContent(lang)
		setContent(data?.content || null)
		setIsLoading(false)
	}

	// Find current language details
	const currentLanguage =
		languages.find(lang => lang.code === language) || languages[0]

	return (
		<div className='about-container'>
			{/* Top bar with home icon and language switcher */}
			<div className='top-bar'>
				<Link href='/' className='home-link'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='home-icon'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
						/>
					</svg>
				</Link>

				<div className='language-switcher'>
					<div className='language-dropdown' ref={dropdownRef}>
						<button
							className='language-dropdown-toggle'
							onClick={() => setIsDropdownOpen(!isDropdownOpen)}
							aria-expanded={isDropdownOpen}
							aria-haspopup='true'
						>
							<span className='flag-emoji'>{currentLanguage.emoji}</span>
							<span className='dropdown-arrow'>▼</span>
						</button>

						<div
							className={`language-dropdown-menu ${
								isDropdownOpen ? 'open' : ''
							}`}
						>
							{languages.map(lang => (
								<FlagButton
									key={lang.code}
									lang={lang.code}
									currentLang={language}
									onClick={() => switchLanguage(lang.code)}
								/>
							))}
						</div>
					</div>
				</div>
			</div>

			{isLoading ? (
				<div className='text-center py-8'>Loading...</div>
			) : content ? (
				<div className='bg-white rounded-lg shadow-md p-6'>
					<InfoContent content={content} />
				</div>
			) : (
				<p>Content not found.</p>
			)}
		</div>
	)
}
