import {
	getContentFolders,
	getMDFilesWithAlias,
	getMDByAlias
} from '@/lib/mdUtils'
import MarkdownContent from '@/components/MarkdownContent'
import SpeechAvailabilityCheck from '@/components/SpeechAvailabilityCheck'
import TopBar from '@/components/TopBar'
import BottomNavigation from '@/components/BottomNavigation'
import { notFound } from 'next/navigation'
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
			<TopBar />

			{/* Проверка доступности озвучивания и предупреждение если недоступно */}
			<SpeechAvailabilityCheck />

			<article className='prose lg:prose-xl mx-auto'>
				<MarkdownContent
					content={mdContent.content}
					folder={folder}
					alias={alias}
				/>
			</article>

			<BottomNavigation currentLesson={alias} />
		</div>
	)
}
