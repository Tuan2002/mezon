import React from 'react';

export interface ToggleItemProps {
    label: string;
    value?: string;
    handleToggle?: (value: string) => void;
    className?: string;
}

const ToggleItem: React.FC<ToggleItemProps> = ({ label, value = "false", handleToggle, className }) => {
    // Khi value là "true" thì checked là true (bật), ngược lại là false (tắt)
    const isChecked = value === "true";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Khi được check thì trả về "true", ngược lại trả về "false"
        const newValue = e.target.checked ? "true" : "false";
        handleToggle?.(newValue);
    };

    return (
        <div className="self-stretch justify-start items-center gap-3 inline-flex text-sm py-1">
            <div className="grow shrink basis-0 h-6 justify-start items-center gap-4 flex">
                <p className="text-[12px] uppercase font-semibold">{label}</p>
                <div className="relative flex flex-wrap items-center">
                    <input
                        className={`peer relative h-4 w-8 cursor-pointer appearance-none rounded-lg
						bg-slate-300 transition-colors after:absolute after:top-0 after:left-0 after:h-4 after:w-4 after:rounded-full
						after:bg-slate-500 after:transition-all
						checked:bg-[#5265EC] checked:after:left-4 checked:after:bg-white
						hover:bg-slate-400 after:hover:bg-slate-600
						checked:hover:bg-[#4654C0] checked:after:hover:bg-white
						focus:outline-none focus-visible:outline-none ${className || ''}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleChange}
                    />
                </div>
            </div>

        </div>
    );
};

export default ToggleItem; 