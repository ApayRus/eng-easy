'use client'

import Link from 'next/link'
import CustomButton from './CustomButton'
import { useEffect, useState } from 'react'

interface BottomNavigationProps {
	currentLesson: string
}

export default function BottomNavigation({
	currentLesson
}: BottomNavigationProps) {
	// Convert current lesson to number and calculate next/previous lesson
	const currentLessonNum = parseInt(currentLesson)
	const nextLesson = currentLessonNum + 1
	const prevLesson = currentLessonNum > 1 ? currentLessonNum - 1 : null

	// State to track if this is the last lesson
	const [isLastLesson, setIsLastLesson] = useState(false)

	// Check if this is the last lesson by fetching lesson data
	useEffect(() => {
		async function checkLastLesson() {
			try {
				const response = await fetch('/api/content')
				if (response.ok) {
					const data = await response.json()
					if (data.lessons && data.lessons.length > 0) {
						// Set isLastLesson to true if current lesson is the last one
						setIsLastLesson(currentLessonNum >= data.lessons.length)
					}
				}
			} catch (error) {
				console.error('Error checking last lesson:', error)
			}
		}

		checkLastLesson()
	}, [currentLessonNum])

	return (
		<div className='nav-buttons'>
			{/* Previous lesson button or empty div for spacing */}
			{prevLesson ? (
				<Link href={`/lessons/${prevLesson}`} className='prev-lesson-button'>
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
			{!isLastLesson ? (
				<Link href={`/lessons/${nextLesson}`} className='next-lesson-button'>
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
