//Sidebar on ALL Pages
//Universal Sidebar component appears on multiple pages
import {useState, createElement} from 'react';
import {BsFillPinMapFill} from 'react-icons/bs';
import {HiMenuAlt3} from 'react-icons/hi';
import {BiWorld, BiDetail} from 'react-icons/bi';
import {TbVaccine, TbMessageReport} from 'react-icons/tb';
import {Link} from 'react-router-dom';
import {useGlobalState} from '../state';

export default function Sidebar() {
	const menus = [
		{name: 'Overview', link: '/', icon: BiWorld},
		{name: 'Country Info', link: '/country-info', icon: BsFillPinMapFill},
		{name: 'Order Detail', link: '/order-detail', icon: BiDetail},
		{name: 'Report', link: '/report', icon: TbMessageReport},
		{name: 'Offer Vaccine', link: '/offer-vaccine', icon: TbVaccine, margin: true},
	];

	const [open, setOpen] = useState(true);
	const [country] = useGlobalState('country');
	const [flag] = useGlobalState('flag');

	return (
		<div
			className={`bg-main-100 min-h-screen ${
				open ? 'w-64' : 'w-16'
			} duration-500 text-gray-100 px-4 sticky top-0 h-screen`}
		>
			<div className='py-3 flex gap-20 justify-end'>
				<div className={`${!open && 'hidden'} font-extrabold text-xl `}>SHAREVAX</div>
				<HiMenuAlt3 size={26} className='cursor-pointer' onClick={() => setOpen(!open)} />
			</div>
			<div className='mt-4 flex flex-col gap-4 relative'>
				{menus?.map((menu, i) => (
					<Link
						to={menu?.link}
						key={i}
						className={` ${
							menu?.margin && 'mt-5'
						} group flex items-center text-sm  gap-3.5 font-medium p-2 hover:bg-main-300 rounded-md`}
					>
						<div>{createElement(menu?.icon, {size: '20'})}</div>
						<h2
							style={{
								transitionDelay: `${i + 3}00ms`,
							}}
							className={`whitespace-pre duration-500 ${!open && 'opacity-0 translate-x-28 overflow-hidden'}`}
						>
							{menu?.name}
						</h2>
						<h2
							className={`${
								open && 'hidden'
							} absolute z-50 left-48 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-14 group-hover:duration-300 group-hover:w-fit  `}
						>
							{menu?.name}
						</h2>
					</Link>
				))}
			</div>
			<div className='flex items-center gap-2 absolute bottom-5 px-2'>
				<div className='text-2xl'>{flag}</div>
				<div className='text-base'>{country}</div>
			</div>
		</div>
	);
}
