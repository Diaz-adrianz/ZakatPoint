import VisitorLayoutTemplate from '@/layouts/visitor/layout';

export default function VisitorLayout({ children, ...props }: { children: React.ReactNode }) {
    return <VisitorLayoutTemplate {...props}>{children}</VisitorLayoutTemplate>;
}
