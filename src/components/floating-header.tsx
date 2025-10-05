import React from 'react';
import { Grid2x2PlusIcon, MenuIcon } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/utils/index';

export interface FloatingHeaderProps {
    analyzedUrl: string;
    onGoHome: () => void;
    showPlan: boolean;
}

export function FloatingHeader({ analyzedUrl, onGoHome, showPlan }: FloatingHeaderProps) {
    const [open, setOpen] = React.useState(false);

    const links = [
        { label: 'Statistics', href: '#stats' },
        { label: 'Goal Planning', href: '#goals' },
        ...(showPlan ? [{ label: 'Plan', href: '#plan' }] : []),
    ];

    return (
        <header
            className={cn(
                'sticky top-4 z-50',
                'mx-auto w-full max-w-5xl rounded-lg border shadow',
                'bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg',
            )}
        >
            <nav className="mx-auto flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onGoHome}>
                        ← New Analysis
                    </Button>
                    <div className="hover:bg-accent hidden cursor-default items-center gap-2 rounded-md px-2 py-1 duration-100 sm:flex">
                        <Grid2x2PlusIcon className="size-5" />
                        <p className="font-mono text-sm font-bold">SkillRack Tracker</p>
                    </div>
                </div>
                <div className="hidden items-center gap-1 lg:flex">
                    {links.map((link) => (
                        <a
                            key={link.href}
                            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                            href={link.href}
                        >
                            {link.label}
                        </a>
                    ))}
                    <a
                        className={buttonVariants({ variant: 'link', size: 'sm' })}
                        href={analyzedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View Profile ↗
                    </a>
                </div>
                <div className="flex items-center gap-2 lg:hidden">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setOpen(!open)}
                            className="lg:hidden"
                        >
                            <MenuIcon className="size-4" />
                        </Button>
                        <SheetContent
                            className="bg-background/95 supports-[backdrop-filter]:bg-background/80 gap-0 backdrop-blur-lg"
                            showClose={false}
                            side="left"
                        >
                            <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
                                <Button variant="outline" className="justify-start" onClick={onGoHome}>
                                    ← New Analysis
                                </Button>
                                {links.map((link) => (
                                    <a
                                        key={link.href}
                                        className={buttonVariants({
                                            variant: 'ghost',
                                            className: 'justify-start',
                                        })}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                <a
                                    className={buttonVariants({ variant: 'link', className: 'justify-start' })}
                                    href={analyzedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpen(false)}
                                >
                                    View Profile ↗
                                </a>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}
