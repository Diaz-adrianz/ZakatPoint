import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpenIcon, BriefcaseBusinessIcon, CoinsIcon, HandCoinsIcon, HeartHandshakeIcon, LayoutGrid, StoreIcon, UsersIcon } from 'lucide-react';
import AppLogo from './app-logo';
import SelectVillage from './select-village';

const mainNavItems: NavItem[] = [
    {
        title: 'Dasbor',
        href: '/dasbor',
        icon: LayoutGrid,
    },
];

const financeNavItems: NavItem[] = [
    {
        title: 'Zakat mal',
        href: '/zakat-mal',
        icon: CoinsIcon,
    },
    {
        title: 'Zakat penghasilan',
        href: '/zakat-penghasilan',
        icon: BriefcaseBusinessIcon,
    },
    {
        title: 'Zakat fitrah',
        href: '/zakat-fitrah',
        icon: HandCoinsIcon,
    },
    {
        title: 'Donasi',
        href: '/donasi',
        icon: HeartHandshakeIcon,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Artikel',
        href: '/daftar-artikel',
        icon: BookOpenIcon,
    },
    {
        title: 'Penduduk',
        href: '/penduduk',
        icon: UsersIcon,
    },
    {
        title: 'Profil desa',
        href: '/profil-desa',
        icon: StoreIcon,
    },
];

export function AppSidebar() {
    const { villageId } = usePage<SharedData>().props;

    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-6">
                <SelectVillage />
                <NavMain items={mainNavItems} />
                {!!villageId && (
                    <>
                        <NavMain label="Keuangan" items={financeNavItems} />
                        <NavMain label="Admin" items={adminNavItems} />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
