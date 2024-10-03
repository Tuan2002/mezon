import { Icons, Image } from '@mezon/ui';
import { memo } from 'react';
import { Link } from 'react-router-dom';

type HeaderProps = {
	sideBarIsOpen: boolean;
	toggleSideBar: () => void;
	scrollToSection: (id: string, event: React.MouseEvent) => void;
};

export const HeaderMezon = memo((props: HeaderProps) => {
	const { sideBarIsOpen, toggleSideBar, scrollToSection } = props;
	return (
		<div className={`header max-md:fixed z-50 w-10/12 max-lg:w-full max-md:border-b-[1px] max-md:border-[#4465FF4D] max-md:bg-[#0B0E2D]`}>
			<div className="flex items-center justify-between md:px-[32px] max-md:px-[16px] max-md:py-[14px] h-[80px] max-md:h-[72px]">
				<div className="flex items-center gap-[40px]">
					<Link to={'/mezon'} className="flex items-center gap-[4.92px]">
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
					<div className="hidden md:flex items-center gap-[32px]">
						<a
							href="#home"
							onClick={(event) => scrollToSection('home', event)}
							className="border-b-2 border-transparent hover:border-[#8FA7BF] hover:text-[#8FA7BF] focus:border-transparent focus:rounded-lg shadow-none focus:shadow-[0px_0px_0px_4px_#678FFF] text-[16px] leading-[24px] text-[#7C92AF] font-semibold flex flex-row items-center px-[2px]"
						>
							Home
						</a>
						<a
							href="#overview"
							onClick={(event) => scrollToSection('overview', event)}
							className="border-b-2 border-transparent hover:border-[#8FA7BF] hover:text-[#8FA7BF] focus:border-transparent focus:rounded-lg shadow-none focus:shadow-[0px_0px_0px_4px_#678FFF] text-[16px] leading-[24px] text-[#7C92AF] font-semibold flex flex-row items-center px-[2px]"
						>
							Overview
						</a>
						<a
							href="#features"
							onClick={(event) => scrollToSection('features', event)}
							className="border-b-2 border-transparent hover:border-[#8FA7BF] hover:text-[#8FA7BF] focus:border-transparent focus:rounded-lg shadow-none focus:shadow-[0px_0px_0px_4px_#678FFF] text-[16px] leading-[24px] text-[#7C92AF] font-semibold flex flex-row items-center px-[2px]"
						>
							Features
						</a>
					</div>
				</div>
				<div className="w-fit">
					<Link
						className="hidden md:block px-[16px] py-[10px] bg-[#1024D4] rounded-lg text-[#F4F7F9] font-semibold hover:bg-[#0C1AB2] focus:bg-[#281FB5]"
						style={{ boxShadow: '0px 0px 0px 1px #1018282E inset' }}
						to={'/mezon'}
					>
						Login
					</Link>
					<Icons.HomepageMenu className="hidden w-[40px] max-md:block" onClick={toggleSideBar} />
				</div>
			</div>

			{!sideBarIsOpen && (
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
			)}
		</div>
	);
});
