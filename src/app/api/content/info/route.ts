import { NextRequest, NextResponse } from 'next/server'
import { getMDByLanguage } from '@/lib/mdUtils'

export async function GET(request: NextRequest) {
	// Get the language from the query parameters
	const searchParams = request.nextUrl.searchParams
	const lang = searchParams.get('lang') || 'en'
	const page = searchParams.get('page') || 'about'

	// Get content for the requested language with fallback to English
	const content = getMDByLanguage(`info/${page}`, [lang, 'en'])

	if (!content) {
		return NextResponse.json({ error: 'Content not found' }, { status: 404 })
	}

	return NextResponse.json(content)
}
