// Отдельный модуль, а не `import('@sentry/browser')` прямо в sentry-boot.ts: так
// в чанк SDK попадает только то, что здесь названо, остальное вытряхивается.
export { captureException, init } from '@sentry/browser'
