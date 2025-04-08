import { getMDByLanguage } from '@/lib/mdUtils'
import InfoContent from '@/components/InfoContent'
import Link from 'next/link'
import '../about/about.css'

export default function HowToUsePage() {
	// Get content for Russian language
	const content = getMDByLanguage('info/how-to-use', ['ru'])

	return (
		<div className='about-container'>
			{/* Top bar with home icon */}
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
			</div>

			{content ? (
				<div className='bg-white rounded-lg shadow-md p-6'>
					<InfoContent content={content.content} />
				</div>
			) : (
				<div className='text-center py-8'>Контент не найден</div>
			)}
		</div>
	)
}
