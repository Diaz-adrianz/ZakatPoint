import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <img src='https://www.megasyariah.co.id/bms-new/edukasi-tips/mustahik_adalah.png' className="absolute top-0 size-full object-cover left-0"/>
                <div className="absolute inset-0 bg-zinc-800/60 size-full z-1" />
                <Link href={route('home')} className="relative z-20 flex items-center text-lg font-medium">
                    {/* <AppLogoIcon className="mr-2 size-8 fill-current text-white" /> */}
                    {name}
                </Link>

                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">&ldquo;{'Dan dirikanlah shalat, tunaikanlah zakat'}&rdquo;</p>
                        <footer className="text-sm text-neutral-300">Qs. Al-Baqarah ayat 43</footer>
                    </blockquote>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogoIcon className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
