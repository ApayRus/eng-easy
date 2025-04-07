import {
	getContentFolders,
	getMDFilesWithAlias,
	getMDByAlias
} from '@/lib/mdUtils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import './page.css'

// Define the types for the page parameters
interface PageProps {
	params: {
		folder: string
	}
}

// Generate static paths for all content folders at build time
export function generateStaticParams() {
	const folders = getContentFolders()
	return folders.map(folder => ({ folder }))
}

export default function FolderPage({ params }: PageProps) {
	const { folder } = params
	const mdFiles = getMDFilesWithAlias(folder)

	if (mdFiles.length === 0 && !getContentFolders().includes(folder)) {
		notFound()
	}

	const lessons = mdFiles.map(file => {
		const content = getMDByAlias(folder, file.alias)
		const titleMatch = content?.content.match(/^#\s+(.+)$/m)
		return { ...file, title: titleMatch ? titleMatch[1] : '' }
	})

	return (
		<div className='folder-page'>
			<div className='back-link'>
				<Link href='/'>← Back</Link>
			</div>

			<h1 className='folder-title'>
				{folder.charAt(0).toUpperCase() + folder.slice(1)}
			</h1>

			{lessons.length > 0 ? (
				<div className='lessons-container'>
					<div className='lessons-list'>
						{lessons.map(lesson => (
							<div key={lesson.slug} className='lesson-item'>
								<Link
									href={`/${folder}/${lesson.alias}`}
									className='lesson-link'
								>
									{lesson.title}
								</Link>
							</div>
						))}
					</div>
				</div>
			) : (
				<p className='no-content'>No content found in this folder.</p>
			)}
		</div>
	)
}
