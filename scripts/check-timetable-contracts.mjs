import { readFile } from 'node:fs/promises'
import process from 'node:process'

const files = {
  routes: new URL('../src/router/timetableSetupRoute.js', import.meta.url),
  api: new URL('../src/services/timetableApi.js', import.meta.url),
  sidebar: new URL('../src/config/sidebar.js', import.meta.url),
}

const [routes, api, sidebar] = await Promise.all([
  readFile(files.routes, 'utf8'),
  readFile(files.api, 'utf8'),
  readFile(files.sidebar, 'utf8'),
])

const requiredRoutes = [
  ['timetable.generator', 'academic-planning/timetable-generator'],
  ['timetable.batch-generator', 'academic-planning/timetable-batch-generator'],
  ['timetable.editor', 'academic-planning/timetable-editor'],
  ['timetable.reports', 'academic-planning/timetable-reports'],
  ['timetable.templates', 'academic-planning/timetable-templates'],
  ['timetable.rules', 'academic-planning/timetable-rules'],
  ['timetable.rooms', 'academic-planning/timetable-rooms'],
  ['timetable.parallel-groups', 'academic-planning/parallel-groups'],
]

const requiredApiFragments = [
  '/academic-planning/dashboard',
  '/weekly-timetables',
  '/timetable-generator/preview',
  '/timetable-generator/generate',
  '/timetable-optimizer/preview',
  '/timetable-optimizer/generate',
  '/timetable-batch-generator/preview',
  '/timetable-batch-generator/generate',
  '/timetable-generation-runs',
  '/grid',
  '/entries',
  '/versions',
  '/publish',
  '/archive',
  '/restore',
  '/timetable-reports/classes/',
  '/timetable-reports/teachers/',
  '/timetable-reports/rooms/',
  '/timetable-reports/workload',
  '/timetable-reports/conflicts',
]

const requiredAliases = [
  'timetable-generator',
  'timetable-batch-generator',
  'weekly-timetables',
  'timetable-editor',
  'timetable-reports',
]

const failures = []

for (const [name, path] of requiredRoutes) {
  if (!routes.includes(`name: '${name}'`)) failures.push(`Missing route name: ${name}`)
  if (!routes.includes(`path: '${path}'`)) failures.push(`Missing route path: ${path}`)
}

for (const fragment of requiredApiFragments) {
  if (!api.includes(fragment)) failures.push(`Missing API contract: ${fragment}`)
}

for (const alias of requiredAliases) {
  if (!sidebar.includes(`"${alias}"`)) failures.push(`Missing sidebar alias: ${alias}`)
}

if (failures.length) {
  console.error('Timetable frontend contract check failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`Timetable frontend contracts verified: ${requiredRoutes.length} routes, ${requiredApiFragments.length} API fragments, ${requiredAliases.length} sidebar aliases.`)
