import * as React from 'react';

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(({ children, ...props }, ref) => {
    if (React.isValidElement(children)) {
        const childProps = children.props as any;
        return React.cloneElement(children, {
            ...props,
            ...childProps,
            className: [props.className, childProps.className].filter(Boolean).join(' '),
            ref,
        });
    }
    return <span ref={ref as any} {...props}>{children}</span>;
});
Slot.displayName = 'Slot';
