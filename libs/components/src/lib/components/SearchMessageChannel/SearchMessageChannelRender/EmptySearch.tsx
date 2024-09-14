const EmptySearch = () => {
	const imagePath = `assets/images/empty-search.svg`;
	return (
		<div className="flex flex-col flex-1 h-full p-4 bg-bgLightSecondary dark:bg-bgSecondary overflow-y-auto">
			<div className="m-auto">
				<img className="w-[160px] h-[160px] mx-auto pointer-events-none" src={`file://${imagePath}`} alt="empty-search" />
				<div className="text-base font-medium w-[280px] mt-10 text-center text-textLightTheme dark:text-textPrimary">
					We searched far and wide. Unfortunately, no results were found.
				</div>
			</div>
		</div>
	);
};

export default EmptySearch;
