import * as Sentry from '@sentry/node'

import pkg from '#package.json' with { type: 'json' }
import { dataCollection, droppedIntegrations } from '#shared/sentry.ts'

// Ошибки чата в Sentry. Грузится через `node --import` раньше server.ts, иначе SDK
// не успевает встроиться в node:http. Без SENTRY_DSN не включается: локально чат
// работает и без него.

if (process.env.SENTRY_DSN) {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		release: `${pkg.name}@${pkg.version}`,
		environment: 'production',
		dataCollection,
		integrations: (defaults) => [
			...defaults.filter(({ name }) => !droppedIntegrations.includes(name) && name !== 'Http'),
			Sentry.httpIntegration({ sessions: false }),
		],
	})
}
