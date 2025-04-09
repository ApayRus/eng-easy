'use client'

import Link from 'next/link'
import CustomButton from './CustomButton'
import { useEffect, useState } from 'react'

interface BottomNavigationProps {
	currentLesson: string
}

interface NavigationState {
	nextLesson: string | null
	prevLesson: string | null
	isLastLesson: boolean
}

export default function BottomNavigation({
	currentLesson
}: BottomNavigationProps) {
	// State to track navigation options
	const [navigation, setNavigation] = useState<NavigationState>({
		nextLesson: null,
		prevLesson: null,
		isLastLesson: false
	})

	// Fetch next and previous lessons based on order
	useEffect(() => {
		async function fetchNavigation() {
			try {
				const response = await fetch(
					`/api/lessons/navigation?current=${currentLesson}`
				)
				if (response.ok) {
					const data = await response.json()
					setNavigation({
						nextLesson: data.nextLesson?.alias || null,
						prevLesson: data.prevLesson?.alias || null,
						isLastLesson: !data.nextLesson
					})
				}
			} catch (error) {
				console.error('Error fetching navigation:', error)
			}
		}

		fetchNavigation()
	}, [currentLesson])

	return (
		<div className='nav-buttons'>
			{/* Previous lesson button or empty div for spacing */}
			{navigation.prevLesson ? (
				<Link
					href={`/lessons/${navigation.prevLesson}`}
					className='prev-lesson-button'
				>
					<CustomButton>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='chevron-icon chevron-left'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M15 19l-7-7 7-7'
							/>
						</svg>
						Назад
					</CustomButton>
				</Link>
			) : (
				<div>{/* Empty div for spacing when on first lesson */}</div>
			)}

			{/* Next lesson button or empty div for spacing */}
			{navigation.nextLesson ? (
				<Link
					href={`/lessons/${navigation.nextLesson}`}
					className='next-lesson-button'
				>
					<CustomButton>
						Дальше
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='chevron-icon'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M9 5l7 7-7 7'
							/>
						</svg>
					</CustomButton>
				</Link>
			) : (
				<div>{/* Empty div for spacing when on last lesson */}</div>
			)}
		</div>
	)
}
