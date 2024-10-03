import { Icons, Image } from '@mezon/ui';
import debounce from 'lodash.debounce';
import { memo, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type SideBarProps = {
	sideBarIsOpen: boolean;
	toggleSideBar: () => void;
	scrollToSection: (id: string, event: React.MouseEvent) => void;
};

export const SideBarMezon = memo((props: SideBarProps) => {
	const { sideBarIsOpen, toggleSideBar, scrollToSection } = props;

	const [bodySideBarRef, setBodySideBarRef] = useState(0);
	const headerSideBarRef = useRef<HTMLDivElement>(null);
	const footerSideBarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const updateBodyHeight = debounce(() => {
			const headerHeight = headerSideBarRef.current?.offsetHeight || 0;
			const footerHeight = footerSideBarRef.current?.offsetHeight || 0;
			const windowHeight = window.innerHeight;

			setBodySideBarRef(windowHeight - headerHeight - footerHeight);
		}, 100);

		updateBodyHeight();
		window.addEventListener('resize', updateBodyHeight);

		if (sideBarIsOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}

		return () => {
			document.body.style.overflow = 'auto';
			window.removeEventListener('resize', updateBodyHeight);
		};
	}, [sideBarIsOpen]);

	return (
		<div
			className={`fixed h-full z-50 w-full bg-[#0B0E2D] transform transition-transform duration-300 ease-in-out ${sideBarIsOpen ? 'translate-x-0' : '-translate-x-full'}`}
		>
			<div
				ref={headerSideBarRef}
				className="flex items-center justify-between pt-[14px] pr-[16px] pb-[14px] pl-[16px] border-b border-b-[#4465FF4D] h-[72px] relative"
			>
				<Link to={'/mezon'} className="flex gap-[4.92px] items-center">
					<Image
						src={`assets/images/mezon-logo-black.svg`}
						alt={'logoMezon'}
						width={32}
						height={32}
						className="aspect-square object-cover"
					/>
					<div className="font-semibold text-[22.15px] leading-[26.58px]" style={{ fontFamily: 'Poppins' }}>
						mezon
					</div>
				</Link>
				<Icons.MenuClose className="w-[20px] max-lg:block" onClick={toggleSideBar} />

				<div
					className="hidden max-md:block"
					style={{
						position: 'absolute',
						top: '-50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: '300px',
						height: '200px',
						background: '#8D72C5',
						filter: 'blur(100px)',
						borderRadius: '50%'
					}}
				></div>
			</div>

			<div
				className="px-[16px] py-[16px] flex flex-col gap-[16px] h-full"
				style={{
					backgroundImage: 'url(../../../assets/header-bg-mobile.png)',
					backgroundRepeat: 'no-repeat',
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					height: `${bodySideBarRef}px`
				}}
			>
				<a
					href="#home"
					onClick={(event) => scrollToSection('home', event)}
					className="text-center px-[16px] py-[10px] text-[#F4F7F9] font-semibold text-base hover:bg-[#0C1AB2] hover:rounded-[8px] focus:rounded-[8px] focus:bg-[#281FB5]"
				>
					Home
				</a>
				<a
					href="#overview"
					onClick={(event) => scrollToSection('overview', event)}
					className="text-center px-[16px] py-[10px] text-[#F4F7F9] font-semibold text-base hover:bg-[#0C1AB2] hover:rounded-[8px] focus:rounded-[8px] focus:bg-[#281FB5]"
				>
					Overview
				</a>
				<a
					href="#feature"
					onClick={(event) => scrollToSection('feature', event)}
					className="text-center px-[16px] py-[10px] text-[#F4F7F9] font-semibold text-base hover:bg-[#0C1AB2] hover:rounded-[8px] focus:rounded-[8px] focus:bg-[#281FB5]"
				>
					Features
				</a>
				<Link
					className="text-center px-[16px] py-[10px] rounded-[8px] bg-[#1024D4] text-[#F4F7F9] font-semibold text-base hover:bg-[#0C1AB2] focus:bg-[#281FB5]"
					to={'/mezon'}
				>
					Login
				</Link>
			</div>

			<div ref={footerSideBarRef} className="container w-full py-[48px] absolute bottom-0">
				<div className="flex flex-col gap-[24px] max-lg:px-[32px]">
					<div className="flex items-center gap-[24px]">
						<a href="#link" className="cursor-pointer">
							<Image src={`assets/instagram.svg`} alt={'linkedIn'} />
						</a>
						<a href="#facebook" className="cursor-pointer">
							<Image src={`assets/facebook.svg`} alt={'facebook'} />
						</a>
						<a href="#github" className="cursor-pointer">
							<Image src={`assets/twitter.svg`} alt={'twitter'} />
						</a>
					</div>
					<div className="font-normal text-[16px] leading-[24px] text-[#7C92AF]">© 2024 Mezon. All rights reserved.</div>
				</div>
			</div>
		</div>
	);
});
