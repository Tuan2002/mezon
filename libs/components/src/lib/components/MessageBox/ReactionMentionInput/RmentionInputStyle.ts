import { OverflowY } from '@mezon/utils';

export default {
	control: {
		fontSize: 16
	},

	'&multiLine': {
		control: {
			fontFamily: 'gg sans, sans-serif',
			minHeight: 35,
			border: 'none',
			outline: 'none'
		},
		highlighter: {
			padding: '9px 120px 9px 9px',
			border: 'none',
			maxHeight: '350px',
			overflow: 'auto'
		},
		input: {
			padding: '9px 120px 9px 9px',
			border: 'none',
			outline: 'none',
			maxHeight: '350px',
			overflow: 'auto'
		}
	},

	'&singleLine': {
		display: 'inline-block',
		width: 180,

		highlighter: {
			padding: 1,
			border: '2px inset transparent'
		},
		input: {
			padding: 1,
			border: '2px inset'
		}
	},

	suggestions: {
		top: '20px',
		list: {
			overflowY: 'auto' as OverflowY,
			maxHeight: '450px'
		},
		item: {
			margin: '0 8px',
			padding: '8px',
			'&focused': {
				backgroundColor: 'hsl(240 calc(1 * 4%) 60.784% /0.12156862745098039)',
				borderRadius: 3
			}
		}
	}
};
