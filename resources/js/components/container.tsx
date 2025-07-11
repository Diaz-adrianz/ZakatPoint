import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';

type ContainerProps = {
    children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

const Container = forwardRef<HTMLDivElement, ContainerProps>(({ children, className, ...props }, ref) => {
    return (
        <div ref={ref} className={cn('mx-auto w-full overflow-x-hidden max-w-7xl p-6', className)} {...props}>
            {children}
        </div>
    );
});

Container.displayName = 'Container';

export default Container;
