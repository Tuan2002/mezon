const jsonPath = '../../assets/.well-known/assetlinks.json';
const AssetLinkLayout = () => (
	<iframe title={jsonPath} src={jsonPath} style={{ width: '100%', height: '100vh', border: 'none' }} sandbox="allow-same-origin" loading="lazy" />
);

export default AssetLinkLayout;
