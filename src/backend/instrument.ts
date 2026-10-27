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
		// Исходящие запросы без хлебных крошек: у Telegram токен бота лежит прямо в пути URL.
		integrations: (defaults) => [
			...defaults.filter(
				({ name }) => !droppedIntegrations.includes(name) && !['Http', 'NodeFetch'].includes(name),
			),
			Sentry.httpIntegration({ sessions: false, breadcrumbs: false }),
			Sentry.nativeNodeFetchIntegration({ breadcrumbs: false }),
		],
		// Сообщение SyntaxError из JSON.parse цитирует разобранный текст, а это поток ответа
		// модели или аргументы выжимки, то есть пересказ разговора. Тип и стектрейс остаются.
		beforeSend(event) {
			for (const exception of event.exception?.values ?? []) {
				if (exception.type === 'SyntaxError') exception.value = 'Invalid JSON (message dropped)'
			}

			return event
		},
	})
}
