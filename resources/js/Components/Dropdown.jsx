import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { cloneElement, createContext, useContext, useEffect, useId, useRef, useState } from 'react';

const DropDownContext = createContext(null);

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const menuId = useId();

    useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (event) => {
            const items = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') ?? [])];
            const index = items.indexOf(document.activeElement);
            if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                const direction = event.key === 'ArrowDown' ? 1 : -1;
                const nextIndex = index < 0 ? (direction > 0 ? 0 : items.length - 1) : (index + direction + items.length) % items.length;
                items[nextIndex]?.focus();
            } else if (event.key === 'Home' || event.key === 'End') {
                event.preventDefault();
                items[event.key === 'Home' ? 0 : items.length - 1]?.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open]);

    return <DropDownContext.Provider value={{ open, setOpen, triggerRef, menuRef, menuId }}>{children}</DropDownContext.Provider>;
};

const Trigger = ({ children }) => {
    const { open, setOpen, triggerRef, menuId, menuRef } = useContext(DropDownContext);
    return cloneElement(children, {
        ref: triggerRef,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': menuId,
        onClick: (event) => {
            children.props.onClick?.(event);
            setOpen((previous) => !previous);
        },
        onKeyDown: (event) => {
            children.props.onKeyDown?.(event);
            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setOpen(true);
                requestAnimationFrame(() => menuRef.current?.querySelector('[role="menuitem"]')?.focus());
            }
        },
    });
};

const Content = ({ align = 'right', width = '48', contentClasses = 'py-1 bg-white', children }) => {
    const { open, setOpen, menuRef, menuId, triggerRef } = useContext(DropDownContext);
    const alignmentClasses = align === 'left' ? 'ltr:origin-top-left rtl:origin-top-right start-0' : 'ltr:origin-top-right rtl:origin-top-left end-0';
    const widthClass = width === '48' ? 'w-48' : '';

    return (
        <>
            {open && <button type="button" aria-hidden="true" tabIndex={-1} className="fixed inset-0 z-40 cursor-default" onClick={() => { setOpen(false); triggerRef.current?.focus(); }} />}
            <Transition show={open} enter="transition ease-out duration-150" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <div id={menuId} ref={menuRef} role="menu" className={`absolute z-50 mt-2 rounded-lg shadow-lg ${alignmentClasses} ${widthClass}`}>
                    <div className={`rounded-lg ring-1 ring-black/10 ${contentClasses}`} onClick={() => setOpen(false)}>{children}</div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => (
    <Link {...props} role="menuitem" tabIndex={-1} className={`flex min-h-11 w-full items-center px-4 py-2 text-start text-sm text-slate-800 transition hover:bg-teal-50 focus:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${className}`}>
        {children}
    </Link>
);

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
