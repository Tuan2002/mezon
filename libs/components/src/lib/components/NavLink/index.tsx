import { Link } from 'react-router-dom';

export type NavLinkProps = {
  href: string;
  active?: boolean;
  children?: React.ReactElement | string;
};

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    // remove <a> to fix the bug validateDOMNesting(...):
    <Link to={href} className="group block relative">
      <div className="flex absolute -left-3 items-center h-full">
        <div
          className={`${
            active
              ? 'h-10'
              : 'h-5 scale-0 opacity-0 group-hover:opacity-100 group-hover:scale-100'
          } w-1 transition-all duration-200 origin-left bg-white rounded-r`}
        ></div>
      </div>

      <div className="group-active:translate-y-px">
        <div
          className={`${
            active
              ? 'rounded-2xl bg-brand text-white'
              : 'text-gray-100 group-hover:rounded-2xl group-hover:bg-brand group-hover:text-white bg-gray-700 rounded-3xl'
          } flex items-center justify-center w-12 h-12 transition-all duration-200 overflow-hidden`}
        >
          {children}
        </div>
      </div>
    </Link>
  );
}

export default NavLink;
