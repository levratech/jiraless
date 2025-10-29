#!/usr/bin/env node
/**
 * Jiraless v0.8 Watchdog
 * - Polls GitHub for PR updates affecting .project/objects/**
 * - Triggers materialize.mjs and workflow_dispatch when changes detected
 * - Records events in ui/public/events.json (capped to 50)
 */

import fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'

const REPO_ROOT = process.cwd()
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPOSITORY || 'levratech/jiraless'
const WATCHDOG_FILE = '.project/views/watchdog.json'
const EVENTS_FILE = 'ui/public/events.json'

async function githubFetch(endpoint, options = {}) {
	const url = `https://api.github.com/repos/${GITHUB_REPO}${endpoint}`
	const headers = {
		Authorization: GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : undefined,
		Accept: 'application/vnd.github.v3+json',
		'User-Agent': 'jiraless-watchdog/0.8',
	}

	const response = await fetch(url, { ...options, headers })
	if (!response.ok) {
		throw new Error(
			`GitHub API error: ${response.status} ${response.statusText}`
		)
	}
	return response.json()
}

async function readLastRun() {
	try {
		const data = await fs.readFile(WATCHDOG_FILE, 'utf8')
		const parsed = JSON.parse(data)
		return parsed.last_run || new Date(0).toISOString()
	} catch {
		return new Date(0).toISOString()
	}
}

async function writeLastRun(lastRun) {
	const data = { last_run: lastRun }
	await fs.mkdir(path.dirname(WATCHDOG_FILE), { recursive: true })
	await fs.writeFile(WATCHDOG_FILE, JSON.stringify(data, null, 2), 'utf8')
}

async function getRecentPRs(since) {
	const prs = []
	let page = 1
	const perPage = 100

	while (true) {
		const endpoint = `/pulls?state=all&sort=updated&direction=desc&per_page=${perPage}&page=${page}`
		const batch = await githubFetch(endpoint)

		if (batch.length === 0) break

		// Filter PRs updated since last run
		const recent = batch.filter(
			(pr) => new Date(pr.updated_at) > new Date(since)
		)
		prs.push(...recent)

		// If we got a full page and the last PR in batch is still recent, continue
		if (batch.length === perPage && recent.length > 0) {
			page++
		} else {
			break
		}
	}

	return prs
}

async function prTouchesObjects(pr) {
	try {
		// Get files changed in this PR
		const files = await githubFetch(`/pulls/${pr.number}/files`)
		return files.some((file) => file.filename.startsWith('.project/objects/'))
	} catch (e) {
		console.warn(`Failed to check files for PR ${pr.number}:`, e.message)
		return false
	}
}

async function triggerWorkflowDispatch() {
	const workflowId = 'pages.yml'
	const payload = {
		ref: 'main',
		inputs: {
			trigger: 'watchdog',
		},
	}

	await githubFetch(`/actions/workflows/${workflowId}/dispatches`, {
		method: 'POST',
		body: JSON.stringify(payload),
	})

	console.log('Triggered workflow_dispatch for pages.yml')
}

async function runMaterialize() {
	const { spawn } = await import('child_process')
	return new Promise((resolve, reject) => {
		const child = spawn('node', ['tools/materialize.mjs'], {
			stdio: 'inherit',
			cwd: REPO_ROOT,
		})

		child.on('close', (code) => {
			if (code === 0) {
				resolve()
			} else {
				reject(new Error(`materialize.mjs exited with code ${code}`))
			}
		})

		child.on('error', reject)
	})
}

async function readEvents() {
	try {
		const data = await fs.readFile(EVENTS_FILE, 'utf8')
		return JSON.parse(data)
	} catch {
		return []
	}
}

async function writeEvents(events) {
	// Keep only last 50 events
	const capped = events.slice(-50)
	await fs.mkdir(path.dirname(EVENTS_FILE), { recursive: true })
	await fs.writeFile(EVENTS_FILE, JSON.stringify(capped, null, 2), 'utf8')
}

async function recordEvent(type, data) {
	const events = await readEvents()
	events.push({
		timestamp: new Date().toISOString(),
		type,
		...data,
	})
	await writeEvents(events)
}

async function main() {
	console.log('Jiraless Watchdog starting...')

	const lastRun = await readLastRun()
	console.log(`Last run: ${lastRun}`)

	const now = new Date().toISOString()

	try {
		// Get PRs updated since last run
		const recentPRs = await getRecentPRs(lastRun)
		console.log(`Found ${recentPRs.length} recently updated PRs`)

		// Filter PRs that touch .project/objects/**
		const relevantPRs = []
		for (const pr of recentPRs) {
			if (await prTouchesObjects(pr)) {
				relevantPRs.push(pr)
			}
		}

		console.log(`Found ${relevantPRs.length} PRs affecting .project/objects/**`)

		if (relevantPRs.length > 0) {
			console.log('Changes detected, running materialize.mjs...')
			await runMaterialize()

			console.log('Triggering Pages deploy...')
			await triggerWorkflowDispatch()

			// Record events
			for (const pr of relevantPRs) {
				await recordEvent('pr_update', {
					pr_number: pr.number,
					pr_state: pr.state,
					updated_at: pr.updated_at,
				})
			}

			console.log('Watchdog completed successfully')
		} else {
			console.log('No relevant changes detected')
		}

		// Update last run timestamp
		await writeLastRun(now)
	} catch (error) {
		console.error('Watchdog error:', error)
		await recordEvent('error', { message: error.message })
		process.exit(1)
	}
}

main()
