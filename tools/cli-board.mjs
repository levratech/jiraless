#!/usr/bin/env node
/**
 * Jiraless CLI - Board Counts
 * Prints board statistics to stdout
 */

import fs from 'fs/promises'
import path from 'path'

const REPO_ROOT = process.cwd()

async function main() {
	try {
		// Read stats.json
		const statsPath = path.join(REPO_ROOT, '.project', 'views', 'stats.json')
		const statsData = await fs.readFile(statsPath, 'utf8')
		const stats = JSON.parse(statsData)

		console.log('Jiraless Board Statistics')
		console.log('========================')
		console.log(`Total items: ${stats.count}`)
		console.log()

		console.log('By Status:')
		for (const [status, count] of Object.entries(stats.byStatus)) {
			console.log(`  ${status}: ${count}`)
		}
		console.log()

		console.log('By Type:')
		for (const [type, count] of Object.entries(stats.byType)) {
			console.log(`  ${type}: ${count}`)
		}
		console.log()

		console.log('By Assignee:')
		for (const [assignee, count] of Object.entries(stats.byAssignee)) {
			console.log(`  ${assignee}: ${count}`)
		}
	} catch (error) {
		console.error('Error reading board statistics:', error.message)
		process.exit(1)
	}
}

main()
