import {
	getContentFolders,
	getMDFilesWithAlias,
	getMDByAlias
} from '@/lib/mdUtils'
import MarkdownContent from '@/components/MarkdownContent'
import SpeechControls from '@/components/SpeechControls'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import './page.css'

// For our internal use, define the shape of params when resolved
interface ResolvedParams {
	folder: string
	alias: string
}

// Define the types for the page parameters
interface PageProps {
	params: Promise<ResolvedParams> | undefined
}

// Generate static paths for all content at build time
export function generateStaticParams() {
	const folders = getContentFolders()
	const paths = []

	for (const folder of folders) {
		const files = getMDFilesWithAlias(folder)

		for (const file of files) {
			paths.push({
				folder,
				alias: file.alias
			})
		}
	}

	return paths
}

export default async function ContentPage({ params }: PageProps) {
	// Since params can now be a Promise, we need to await it
	const resolvedParams = (await Promise.resolve(params)) as ResolvedParams
	const { folder, alias } = resolvedParams

	// Get the specific markdown file by its alias
	const mdContent = getMDByAlias(folder, alias)

	// If no content found, return 404
	if (!mdContent) {
		notFound()
	}

	return (
		<div className='content-container'>
			<div className='top-bar'>
				<Link href='/' className='home-link' title='Вернуться на главную'>
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

				<SpeechControls />
			</div>

			<article className='prose lg:prose-xl mx-auto'>
				<MarkdownContent
					content={mdContent.content}
					folder={folder}
					alias={alias}
				/>
			</article>
		</div>
	)
}
