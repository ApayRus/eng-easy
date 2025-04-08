'use client'

import Link from 'next/link'
import CustomButton from './CustomButton'

interface BottomNavigationProps {
	currentLesson: string
}

export default function BottomNavigation({
	currentLesson
}: BottomNavigationProps) {
	// Convert current lesson to number and calculate next lesson
	const currentLessonNum = parseInt(currentLesson)
	const nextLesson = currentLessonNum + 1

	return (
		<div className='next-lesson-button'>
			<Link href={`/lessons/${nextLesson}`}>
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
		</div>
	)
}
