import { dataCollection, droppedIntegrations } from '#shared/sentry.ts'

// Браузерная часть components/sentry.astro. SDK (~30 КБ gzip) не должен спорить за канал
// со шрифтами и первой картинкой, поэтому он грузится отдельным чанком после load, когда
// браузер свободен. Ошибки до этого момента копятся и уходят сразу после инициализации.

export type SentryConfig = { dsn: string; release: string; environment: string }

/**
 * Подключает Sentry на странице.
 *
 * @param config - DSN, релиз и окружение из sentry.astro.
 */
export function bootSentry(config: SentryConfig) {
	const early: (ErrorEvent | PromiseRejectionEvent)[] = []
	const keep = (event: ErrorEvent | PromiseRejectionEvent) => early.push(event)

	addEventListener('error', keep)
	addEventListener('unhandledrejection', keep)

	const start = async () => {
		const { captureException, init } = await import('./sentry-sdk.ts')

		removeEventListener('error', keep)
		removeEventListener('unhandledrejection', keep)

		init({
			...config,
			dataCollection,
			integrations: (defaults) => defaults.filter(({ name }) => !droppedIntegrations.includes(name)),
		})

		// Ранние ошибки помечаем так же, как пометил бы обработчик самого SDK.
		for (const event of early) {
			const error = event instanceof ErrorEvent ? (event.error ?? new Error(event.message)) : event.reason

			captureException(error, { mechanism: { type: `on${event.type}`, handled: false } })
		}
	}

	// Без requestIdleCallback (Safari) хватит и таймера: load уже прошёл.
	const later = () =>
		'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 4000 }) : setTimeout(start, 1000)

	if (document.readyState === 'complete') later()
	else addEventListener('load', later, { once: true })
}
