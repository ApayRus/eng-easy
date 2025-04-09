import { NextResponse } from 'next/server'
import { getNextAndPrevLessons } from '@/lib/mdUtils'

export async function GET(request: Request) {
	// Получаем URL и извлекаем параметры
	const { searchParams } = new URL(request.url)
	const currentAlias = searchParams.get('current')

	if (!currentAlias) {
		return NextResponse.json(
			{ error: 'Current lesson alias is required' },
			{ status: 400 }
		)
	}

	// Получаем следующий и предыдущий уроки на основе их порядка (order)
	const { nextLesson, prevLesson } = getNextAndPrevLessons(
		'lessons',
		currentAlias
	)

	return NextResponse.json({
		nextLesson,
		prevLesson
	})
}
