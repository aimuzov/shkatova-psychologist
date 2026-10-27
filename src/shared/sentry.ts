import type { DataCollection } from '@sentry/core'

// Общие настройки Sentry для браузера и сервиса чата. Уходят только ошибки: без трейсинга,
// сессий, реплеев и профилирования.

/**
 * Что SDK кладёт в событие. С версии 11 `sendDefaultPii` больше нет, вместо него эта опция,
 * и по умолчанию Sentry собирает тела запросов, заголовки, cookies, query-параметры
 * и локальные переменные. У нас в запросах переписка с психологом, поэтому всё выключено,
 * остаются только стектрейс и строки кода вокруг него.
 */
export const dataCollection: DataCollection = {
	userInfo: false,
	cookies: false,
	httpHeaders: false,
	httpBodies: [],
	urlQueryParams: false,
	genAI: { inputs: false, outputs: false },
	stackFrameVariables: false,
}

/**
 * Интеграции по умолчанию, которые выключаем. Сессии шлют запрос на каждый заход или запуск,
 * а нам нужны только ошибки. Консоль уходит в хлебные крошки, и туда может попасть текст
 * из чата: в dev сервис пишет в лог выжимку разговора.
 */
export const droppedIntegrations = ['BrowserSession', 'ProcessSession', 'Console']
