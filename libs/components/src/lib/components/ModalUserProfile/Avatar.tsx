import React from 'react';

type AvatarProps = {
	src?: string;
	alt?: string;
	placeholder?: string;
	isUser?: boolean;
};

const Avatar = ({ src, alt, placeholder, isUser }: AvatarProps) => {
	const imageSrc = src || placeholder || './assets/images/anonymous-avatar.jpg';
	const className = `w-[90px] h-[90px] xl:w-[100px] xl:h-[100px] rounded-[50px] dark:bg-bgSecondary bg-white mt-[-50px] ml-[-25px] border-[6px] border-solid dark:border-bgSecondary600 border-white object-cover`;

	if (!isUser && !src) {
		return (
			<div className={`${className} flex justify-center items-center text-contentSecondary text-[50px]`}>{alt?.charAt(0).toUpperCase()}</div>
		);
	}

	return <img src={imageSrc} alt={alt} className={className} crossOrigin="anonymous" />;
};

export default React.memo(Avatar);
