import { typographText } from '@aimuzov/infra-site-kit/typograph.js'

export function typograph(text: string): string {
	return typographText(text, { thousandsSeparator: ' ', preserveLineBreaks: true })
}
