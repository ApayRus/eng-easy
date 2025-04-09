import fs from 'fs'
import path from 'path'

interface MDMeta {
	alias: string
	order?: number
	title?: string
	[key: string]: string | number | undefined
}

interface MDContent {
	meta: MDMeta
	content: string
}

// Function to get all available content folders
export function getContentFolders(): string[] {
	const contentDir = path.join(process.cwd(), 'content')
	return fs
		.readdirSync(contentDir)
		.filter(folder => fs.statSync(path.join(contentDir, folder)).isDirectory())
}

// Function to parse frontmatter from markdown
export function parseMD(fileContent: string): MDContent {
	const meta: MDMeta = { alias: '' }
	let content = fileContent

	// Check if the file has frontmatter (starts with ---)
	if (fileContent.startsWith('---')) {
		const endOfFrontmatter = fileContent.indexOf('---', 4)

		if (endOfFrontmatter !== -1) {
			const frontmatter = fileContent.slice(4, endOfFrontmatter).trim()
			content = fileContent.slice(endOfFrontmatter + 3).trim()

			// Parse frontmatter
			frontmatter.split('\n').forEach(line => {
				const [key, value] = line.split(':').map(part => part.trim())
				if (key && value) {
					// Convert order to number
					if (key === 'order') {
						meta[key] = parseInt(value, 10)
					} else {
						meta[key] = value
					}
				}
			})
		}
	}

	return { meta, content }
}

// Function to get all markdown files in a folder with their alias and order
export function getMDFilesWithAlias(
	folder: string
): { slug: string; alias: string; order: number }[] {
	const folderPath = path.join(process.cwd(), 'content', folder)

	if (!fs.existsSync(folderPath)) {
		return []
	}

	const files = fs
		.readdirSync(folderPath)
		.filter(file => file.endsWith('.md'))
		.map(file => {
			const fileContent = fs.readFileSync(path.join(folderPath, file), 'utf-8')
			const { meta } = parseMD(fileContent)
			return {
				slug: file.replace('.md', ''),
				alias: meta.alias || file.replace('.md', ''),
				order: meta.order ? Number(meta.order) : 0
			}
		})

	// Sort files by order field
	return files.sort((a, b) => a.order - b.order)
}

// Function to get a specific markdown file by its alias
export function getMDByAlias(folder: string, alias: string): MDContent | null {
	const folderPath = path.join(process.cwd(), 'content', folder)

	if (!fs.existsSync(folderPath)) {
		return null
	}

	const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.md'))

	for (const file of files) {
		const fileContent = fs.readFileSync(path.join(folderPath, file), 'utf-8')
		const parsed = parseMD(fileContent)

		if (parsed.meta.alias === alias) {
			return parsed
		}
	}

	return null
}

// Function to get next and previous lessons by order
export function getNextAndPrevLessons(
	folder: string,
	currentAlias: string
): {
	nextLesson: { alias: string; order: number } | null
	prevLesson: { alias: string; order: number } | null
} {
	const lessons = getMDFilesWithAlias(folder)
	const currentLesson = lessons.find(lesson => lesson.alias === currentAlias)

	if (!currentLesson) {
		return { nextLesson: null, prevLesson: null }
	}

	const currentIndex = lessons.findIndex(
		lesson => lesson.alias === currentAlias
	)
	const nextLesson =
		currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
	const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null

	return {
		nextLesson: nextLesson
			? { alias: nextLesson.alias, order: nextLesson.order }
			: null,
		prevLesson: prevLesson
			? { alias: prevLesson.alias, order: prevLesson.order }
			: null
	}
}

// Function to get all aliases for a folder
export function getAllAliases(folder: string): string[] {
	return getMDFilesWithAlias(folder).map(file => file.alias)
}

// Function to get markdown file by language code
export function getMDByLanguage(
	folder: string,
	languages: string[] = ['en']
): MDContent | null {
	const folderPath = path.join(process.cwd(), 'content', folder)

	if (!fs.existsSync(folderPath)) {
		return null
	}

	// Try each language in the order they are provided
	for (const lang of languages) {
		const filePath = path.join(folderPath, `${lang}.md`)

		if (fs.existsSync(filePath)) {
			const fileContent = fs.readFileSync(filePath, 'utf-8')
			return parseMD(fileContent)
		}
	}

	// If no language match found, try to return en.md as fallback
	const enFilePath = path.join(folderPath, 'en.md')
	if (fs.existsSync(enFilePath)) {
		const fileContent = fs.readFileSync(enFilePath, 'utf-8')
		return parseMD(fileContent)
	}

	// If nothing found, return null
	return null
}
