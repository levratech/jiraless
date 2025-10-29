import React from 'react'

interface BadgesProps {
	pr_number?: number
	pr_state?: 'draft' | 'open' | 'merged' | 'closed'
	checks_state?: 'success' | 'failure' | 'pending'
	updated_at?: string
}

export function Badges({
	pr_number,
	pr_state,
	checks_state,
	updated_at,
}: BadgesProps) {
	if (!pr_number) return null

	const prColors = {
		draft: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },
		open: { bg: '#ecfdf5', border: '#a7f3d0', text: '#059669' },
		merged: { bg: '#e0f2fe', border: '#7dd3fc', text: '#0369a1' },
		closed: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
	}

	const checkColors = {
		success: { bg: '#ecfdf5', border: '#a7f3d0', text: '#059669', icon: '✓' },
		failure: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '✗' },
		pending: { bg: '#fef3c7', border: '#fde68a', text: '#d97706', icon: '○' },
	}

	const prColor = prColors[pr_state || 'open']
	const checkColor = checks_state ? checkColors[checks_state] : null

	return (
		<div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
			<a
				href={`https://github.com/levratech/jiraless/pull/${pr_number}`}
				target="_blank"
				rel="noopener noreferrer"
				style={{ textDecoration: 'none' }}
			>
				<span
					style={{
						fontSize: 10,
						padding: '2px 4px',
						borderRadius: 4,
						background: prColor.bg,
						border: `1px solid ${prColor.border}`,
						color: prColor.text,
						display: 'inline-flex',
						alignItems: 'center',
						gap: 2,
					}}
				>
					#{pr_number} {pr_state}
				</span>
			</a>
			{checkColor && (
				<span
					style={{
						fontSize: 10,
						padding: '2px 4px',
						borderRadius: 4,
						background: checkColor.bg,
						border: `1px solid ${checkColor.border}`,
						color: checkColor.text,
						display: 'inline-flex',
						alignItems: 'center',
						gap: 2,
					}}
				>
					{checkColor.icon} CI
				</span>
			)}
		</div>
	)
}
