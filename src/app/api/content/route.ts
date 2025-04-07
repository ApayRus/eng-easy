import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import {
	getMDFilesWithAlias,
	getMDByAlias,
	getMDByLanguage
} from '@/lib/mdUtils'

export async function GET(request: Request) {
	// Получаем URL и извлекаем параметры
	const { searchParams } = new URL(request.url)
	const languages = searchParams.get('languages')?.split(',') || ['en']

	// Получаем все уроки
	const lessons = getMDFilesWithAlias('lessons')
	// Получаем заголовки для каждого урока
	const lessonItems = lessons.map(lesson => {
		const content = getMDByAlias('lessons', lesson.alias)
		const titleMatch = content?.content.match(/^#\s+(.+)$/m)
		const title = titleMatch ? titleMatch[1] : `Lesson ${lesson.alias}`
		return { ...lesson, title }
	})

	// Получаем папки info вручную
	const infoItems = []
	const infoPath = path.join(process.cwd(), 'content', 'info')

	if (fs.existsSync(infoPath)) {
		const folders = fs
			.readdirSync(infoPath)
			.filter(item => fs.statSync(path.join(infoPath, item)).isDirectory())

		// Создаем info страницы с заголовками
		for (const folder of folders) {
			// Пытаемся получить контент на предпочитаемом языке пользователя
			const content = getMDByLanguage(`info/${folder}`, languages)
			const titleMatch = content?.content.match(/^#\s+(.+)$/m)
			const title = titleMatch ? titleMatch[1] : folder

			infoItems.push({
				slug: folder,
				alias: folder,
				title: title
			})
		}
	}

	return NextResponse.json({
		lessons: lessonItems,
		info: infoItems
	})
}
