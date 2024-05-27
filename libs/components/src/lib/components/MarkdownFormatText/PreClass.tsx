import { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import * as Icons from '../Icons';

const PreClass = ({ children }: any) => {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setCopied(false);
		}, 5000);

		return () => clearTimeout(timer);
	}, [copied]);

	return (
		<pre className="pre">
			<CopyToClipboard text={children.props.children} onCopy={() => setCopied(true)}>
				<button className="icon copy-icon">{copied ? <Icons.PasteIcon /> : <Icons.CopyIcon />}</button>
			</CopyToClipboard>
			<code className="code">{children.props.children?.toString()?.split('```')}</code>
		</pre>
	);
};

export default PreClass;
