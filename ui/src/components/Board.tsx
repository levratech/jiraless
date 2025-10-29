import React, { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchJson } from '../lib/fetch'
import { getTypeMeta } from '../lib/ontology'
import {
	indexBoard,
	filterAndSearch,
	getUniqueValues,
	Filters,
	WorkItem,
	highlightText,
} from '../lib/search'
import { Badges } from './Badges'

type CardT = WorkItem
type BoardData = Record<string, CardT[]>

function norm(p?: string) {
	if (!p) return undefined
	let s = decodeURIComponent(p).replace(/\\/g, '/')
	// strip any absolute CI prefix to be safe
	const ix = s.indexOf('.project/')
	if (ix >= 0) s = s.slice(ix)
	if (s.startsWith('./')) s = s.slice(2)
	if (s.startsWith('/')) s = s.replace(/^\/+/, '')
	return s
}

export function Board() {
	const [board, setBoard] = useState<BoardData | null>(null)
	const [statuses, setStatuses] = useState<string[]>([])
	const [searchParams, setSearchParams] = useSearchParams()
	const [query, setQuery] = useState(searchParams.get('q') || '')

	const filters: Filters = useMemo(
		() => ({
			types: searchParams.get('type')?.split(',').filter(Boolean) || [],
			priorities:
				searchParams.get('priority')?.split(',').filter(Boolean) || [],
			assignees: searchParams.get('assignee')?.split(',').filter(Boolean) || [],
			statuses: searchParams.get('status')?.split(',').filter(Boolean) || [],
			hasPr:
				searchParams.get('hasPr') === 'true'
					? true
					: searchParams.get('hasPr') === 'false'
					? false
					: undefined,
			ciStates: searchParams.get('ci')?.split(',').filter(Boolean) || [],
			query,
		}),
		[searchParams, query]
	)

	const allItems = useMemo(() => (board ? indexBoard(board) : []), [board])
	const filteredItems = useMemo(
		() => filterAndSearch(allItems, filters),
		[allItems, filters]
	)

	// Group filtered items back by status
	const filteredBoard = useMemo(() => {
		const result: BoardData = {}
		filteredItems.forEach((item) => {
			if (!result[item.status]) result[item.status] = []
			result[item.status].push(item)
		})
		return result
	}, [filteredItems])

	const availableTypes = useMemo(
		() => getUniqueValues(allItems, 'type'),
		[allItems]
	)
	const availableAssignees = useMemo(
		() => getUniqueValues(allItems, 'assignees'),
		[allItems]
	)

	useEffect(() => {
		let alive = true
		;(async () => {
			const data = await fetchJson('views/board.json')
			if (!alive) return
			// sanitize any legacy absolute paths
			for (const col of Object.keys(data)) {
				data[col] = data[col].map((c: any) => ({ ...c, file: norm(c.file) }))
			}
			setBoard(data)
			setStatuses(Object.keys(data).sort())
		})()
		return () => {
			alive = false
		}
	}, [])

	const updateFilters = (updates: Partial<Filters>) => {
		const newFilters = { ...filters, ...updates }
		const params = new URLSearchParams()
		if (newFilters.types.length) params.set('type', newFilters.types.join(','))
		if (newFilters.priorities.length)
			params.set('priority', newFilters.priorities.join(','))
		if (newFilters.assignees.length)
			params.set('assignee', newFilters.assignees.join(','))
		if (newFilters.statuses.length)
			params.set('status', newFilters.statuses.join(','))
		if (newFilters.hasPr !== undefined)
			params.set('hasPr', newFilters.hasPr.toString())
		if (newFilters.ciStates && newFilters.ciStates.length)
			params.set('ci', newFilters.ciStates.join(','))
		if (newFilters.query) params.set('q', newFilters.query)
		setSearchParams(params)
	}

	const toggleFilter = (key: keyof Filters, value: string) => {
		const current = filters[key] as string[]
		const updated = current.includes(value)
			? current.filter((v) => v !== value)
			: [...current, value]
		updateFilters({ [key]: updated })
	}

	if (!board) return <div>Loading board…</div>

	return (
		<div>
			{/* Filter Bar */}
			<div
				style={{
					marginBottom: 20,
					padding: 16,
					background: '#f8fafc',
					borderRadius: 8,
					border: '1px solid #e2e8f0',
				}}
			>
				<div
					style={{
						display: 'flex',
						gap: 16,
						flexWrap: 'wrap',
						alignItems: 'center',
					}}
				>
					<div>
						<label style={{ fontSize: 14, fontWeight: 500, marginRight: 8 }}>
							Search:
						</label>
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search titles, content..."
							style={{
								padding: '6px 12px',
								border: '1px solid #d1d5db',
								borderRadius: 4,
								minWidth: 200,
							}}
						/>
					</div>

					<div>
						<label style={{ fontSize: 14, fontWeight: 500, marginRight: 8 }}>
							Type:
						</label>
						<div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
							{availableTypes.map((type) => (
								<button
									key={type}
									onClick={() => toggleFilter('types', type)}
									style={{
										padding: '4px 8px',
										border: `1px solid ${
											filters.types.includes(type) ? '#3b82f6' : '#d1d5db'
										}`,
										background: filters.types.includes(type)
											? '#dbeafe'
											: 'white',
										borderRadius: 4,
										fontSize: 12,
										cursor: 'pointer',
									}}
								>
									{type}
								</button>
							))}
						</div>
					</div>

					<div>
						<label style={{ fontSize: 14, fontWeight: 500, marginRight: 8 }}>
							Priority:
						</label>
						<div style={{ display: 'flex', gap: 4 }}>
							{['p1', 'p2', 'p3', 'p4'].map((prio) => (
								<button
									key={prio}
									onClick={() => toggleFilter('priorities', prio)}
									style={{
										padding: '4px 8px',
										border: `1px solid ${
											filters.priorities.includes(prio) ? '#3b82f6' : '#d1d5db'
										}`,
										background: filters.priorities.includes(prio)
											? '#dbeafe'
											: 'white',
										borderRadius: 4,
										fontSize: 12,
										cursor: 'pointer',
									}}
								>
									{prio.toUpperCase()}
								</button>
							))}
						</div>
					</div>

					<div>
						<label style={{ fontSize: 14, fontWeight: 500, marginRight: 8 }}>
							Assignee:
						</label>
						<input
							type="text"
							placeholder="Filter assignees..."
							onChange={(e) =>
								updateFilters({
									assignees: e.target.value ? [e.target.value] : [],
								})
							}
							style={{
								padding: '6px 12px',
								border: '1px solid #d1d5db',
								borderRadius: 4,
							}}
						/>
					</div>

					<div>
						<label style={{ fontSize: 14, fontWeight: 500, marginRight: 8 }}>
							PR/CI:
						</label>
						<div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
							<button
								onClick={() =>
									updateFilters({
										hasPr: filters.hasPr === true ? undefined : true,
									})
								}
								style={{
									padding: '4px 8px',
									border: `1px solid ${
										filters.hasPr === true ? '#3b82f6' : '#d1d5db'
									}`,
									background: filters.hasPr === true ? '#dbeafe' : 'white',
									borderRadius: 4,
									fontSize: 12,
									cursor: 'pointer',
								}}
							>
								has:pr
							</button>
							{['success', 'failure', 'pending'].map((ciState) => (
								<button
									key={ciState}
									onClick={() => {
										const current = filters.ciStates || []
										const updated = current.includes(ciState)
											? current.filter((v) => v !== ciState)
											: [...current, ciState]
										updateFilters({ ciStates: updated })
									}}
									style={{
										padding: '4px 8px',
										border: `1px solid ${
											(filters.ciStates || []).includes(ciState)
												? '#3b82f6'
												: '#d1d5db'
										}`,
										background: (filters.ciStates || []).includes(ciState)
											? '#dbeafe'
											: 'white',
										borderRadius: 4,
										fontSize: 12,
										cursor: 'pointer',
									}}
								>
									ci:{ciState}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: `repeat(${Math.max(
						statuses.length,
						1
					)}, minmax(280px, 1fr))`,
					gap: 16,
				}}
			>
				{statuses.map((status) => (
					<div
						key={status}
						style={{
							background: '#fafafa',
							border: '1px solid #eee',
							borderRadius: 12,
							padding: 12,
						}}
					>
						<div style={{ fontWeight: 700, marginBottom: 8 }}>
							{status} ({filteredBoard[status]?.length || 0})
						</div>
						<div style={{ display: 'grid', gap: 8 }}>
							{filteredBoard[status]?.map((card) => (
								<Card key={card.id} {...card} query={query} />
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

function Card({
	id,
	title,
	type,
	priority,
	assignees,
	file,
	query,
	pr_number,
	pr_state,
	checks_state,
	updated_at,
}: CardT & { query?: string }) {
	const rel = norm(file)
	const qs = rel ? `?file=${encodeURIComponent(rel)}` : ''

	const copyLink = () => {
		const url = `${window.location.origin}/work/${encodeURIComponent(id)}${qs}`
		navigator.clipboard.writeText(url)
		// Could add a toast here
	}

	return (
		<div style={{ position: 'relative' }}>
			<Link
				to={`/work/${encodeURIComponent(id)}${qs}`}
				style={{ textDecoration: 'none', color: 'inherit' }}
			>
				<div
					style={{
						background: 'white',
						border: '1px solid #e5e7eb',
						borderRadius: 10,
						padding: 10,
						boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
					}}
				>
					<div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
						{id}
					</div>
					<div
						style={{ fontWeight: 600, marginBottom: 6 }}
						dangerouslySetInnerHTML={{
							__html: query ? highlightText(title, query) : title,
						}}
					/>
					<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
						{type.map((t) => {
							const meta = getTypeMeta(t)
							return (
								<span
									key={t}
									style={{
										fontSize: 11,
										padding: '2px 6px',
										borderRadius: 999,
										background: `${meta?.color || '#e5e7eb'}22`,
										border: `1px solid ${meta?.color || '#e5e7eb'}`,
										color: meta?.color || '#374151',
									}}
								>
									{meta?.icon ? `${meta.icon} ` : ''}
									{t}
								</span>
							)
						})}
						{priority && <PriorityBadge priority={priority} />}
						{assignees?.length ? (
							<span
								style={{
									fontSize: 11,
									padding: '2px 6px',
									borderRadius: 999,
									background: '#f1f5f9',
									border: '1px solid #e2e8f0',
									color: '#0f172a',
								}}
							>
								{assignees.join(', ')}
							</span>
						) : null}
					</div>
					<Badges
						pr_number={pr_number}
						pr_state={pr_state}
						checks_state={checks_state}
						updated_at={updated_at}
					/>
				</div>
			</Link>
			<button
				onClick={copyLink}
				style={{
					position: 'absolute',
					top: 8,
					right: 8,
					background: 'white',
					border: '1px solid #e5e7eb',
					borderRadius: 4,
					padding: '4px',
					cursor: 'pointer',
					opacity: 0.7,
				}}
				title="Copy link"
			>
				🔗
			</button>
		</div>
	)
}

function PriorityBadge({ priority }: { priority: string }) {
	const colors = {
		p1: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
		p2: { bg: '#fef3c7', border: '#fde68a', text: '#d97706' },
		p3: { bg: '#ecfdf5', border: '#a7f3d0', text: '#059669' },
		p4: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },
	}
	const color = colors[priority as keyof typeof colors] || colors.p4
	return (
		<span
			style={{
				fontSize: 11,
				padding: '2px 6px',
				borderRadius: 999,
				background: color.bg,
				border: `1px solid ${color.border}`,
				color: color.text,
			}}
		>
			{priority.toUpperCase()}
		</span>
	)
}
