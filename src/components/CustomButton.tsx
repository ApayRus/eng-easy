'use client'

interface CustomButtonProps {
	onClick?: () => void
	children: React.ReactNode
}

export default function CustomButton({ onClick, children }: CustomButtonProps) {
	return (
		<button className='custom-button' onClick={onClick}>
			{children}
		</button>
	)
}
