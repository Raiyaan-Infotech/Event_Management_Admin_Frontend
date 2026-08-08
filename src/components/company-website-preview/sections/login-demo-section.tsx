'use client';

import * as React from 'react';
import {
    Gift,
    ArrowRight,
    Sparkles,
    MessageCircle,
    PlayCircle,
    ShieldCheck,
    Smartphone,
    Globe,
    Music,
    Timer,
    UserCheck,
    Layout,
    Languages,
    Wand2,
    Code,
    Eye,
    Headset,
    QrCode,
    Mail,
    Send,
    Calendar,
    MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionProps {
    theme?: any;
    companyName?: string;
}

import { useWebsiteLanguage } from '../website-language-provider';

// 1. Home Page / Main: Login & Demo Section
export function LoginDemoSection({ theme, companyName }: SectionProps) {
    const { t } = useWebsiteLanguage();
    const primaryBtn = theme?.primaryButton || '#E11D48';

    return (
        <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1280px]">
                <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto">
                        <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-md ring-4 ring-primary/20"
                            style={{ backgroundColor: primaryBtn }}
                        >
                            <Gift className="h-7 w-7 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                                {t('login_demo.ready_title', 'Ready to Create Your Event App?')}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                {t('login_demo.ready_subtitle', 'Join thousands of happy customers who trust {companyName} for their special moments.', { companyName: companyName || 'Event Invit' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                        <Button
                            size="lg"
                            className="font-bold text-white shadow-md px-6 py-2.5 rounded-xl transition-all hover:opacity-95"
                            style={{ backgroundColor: primaryBtn }}
                        >
                            {t('login_demo.get_started_free', 'Get Started Free')}
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="font-bold px-6 py-2.5 rounded-xl bg-background/80 shadow-xs transition-all hover:bg-primary/10 border-2"
                            style={{ borderColor: primaryBtn, color: primaryBtn }}
                        >
                            {t('login_demo.view_demo_app', 'View Demo App')}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

// 2. Features Page: Features First Highlight Showcase (1:1 Match to 3-Column Screenshot Design)
export function FeaturesFirstHighlightSection({ theme, companyName }: SectionProps) {
    const { t } = useWebsiteLanguage();
    const primaryBtn = theme?.primaryButton || '#E11D48';

    return (
        <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1280px]">
                <div className="rounded-3xl border border-primary/20 bg-background p-6 sm:p-8 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        {/* Left Column: Visual Mockup Container with Real Event App Image */}
                        <div className="lg:col-span-3 flex items-center justify-center">
                            <div className="relative w-full rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-purple-500/10 border border-primary/20 p-4 flex flex-col items-center justify-center min-h-[220px] overflow-hidden group">
                                <div
                                    className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl opacity-30 pointer-events-none"
                                    style={{ backgroundColor: primaryBtn }}
                                />
                                <div className="relative z-10 w-full max-w-[190px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden p-2 text-white transition-transform group-hover:scale-105 duration-300">
                                    <div className="h-1.5 w-10 bg-slate-700 rounded-full mx-auto mb-2" />
                                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-700/80 shadow-inner group/img">
                                        <img
                                            src="/images/event-app-mockup.png"
                                            alt="Event App Showcase"
                                            className="w-full h-full object-cover object-center"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 p-2 flex flex-col justify-between pointer-events-none">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-[10px] text-white flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20">
                                                    <Sparkles className="h-2.5 w-2.5" style={{ color: primaryBtn }} /> Event App
                                                </span>
                                                <span className="bg-emerald-500/90 text-white px-1.5 py-0.5 rounded text-[8px] font-bold shadow-xs">
                                                    Live
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle Column: Features List & Interactive Tag Pills */}
                        <div className="lg:col-span-5 space-y-4">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                                    {t('login_demo.much_more_title', 'And Much More')}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground pt-1">
                                    {t('login_demo.much_more_subtitle', 'We keep adding new features to make your event experience better and better.')}
                                </p>
                            </div>

                            {/* 2x3 Feature Pills Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <div className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-2 text-xs font-semibold text-foreground shadow-xs hover:border-primary/40 transition-colors">
                                    <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                    <span className="truncate">{t('login_demo.social_media', 'Social Media')}</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-2 text-xs font-semibold text-foreground shadow-xs hover:border-primary/40 transition-colors">
                                    <Music className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                    <span className="truncate">{t('login_demo.music_player', 'Music Player')}</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-2 text-xs font-semibold text-foreground shadow-xs hover:border-primary/40 transition-colors">
                                    <Timer className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                                    <span className="truncate">{t('login_demo.countdown', 'Countdown')}</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-2 text-xs font-semibold text-foreground shadow-xs hover:border-primary/40 transition-colors">
                                    <UserCheck className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                    <span className="truncate">{t('login_demo.contact_org', 'Contact / Org')}</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-2 text-xs font-semibold text-foreground shadow-xs hover:border-primary/40 transition-colors">
                                    <Layout className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                                    <span className="truncate">{t('login_demo.custom_pages', 'Custom Pages')}</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-2 text-xs font-semibold text-foreground shadow-xs hover:border-primary/40 transition-colors">
                                    <Languages className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                    <span className="truncate">{t('login_demo.multi_language', 'Multi Language')}</span>
                                </div>
                            </div>

                            <div>
                                <span className="inline-flex items-center rounded-xl bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 border border-primary/20">
                                    {t('login_demo.and_feature_plans', '... and Feature Plans')}
                                </span>
                            </div>
                        </div>

                        {/* Right Column: CTA Box (1:1 Match to Mockup Image 2) */}
                        <div className="lg:col-span-4">
                            <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 via-primary/5 to-background p-6 space-y-4 shadow-sm">
                                <div className="flex items-start gap-3.5 text-left">
                                    <div
                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-md ring-4 ring-primary/20"
                                        style={{ backgroundColor: primaryBtn }}
                                    >
                                        <Gift className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm sm:text-base font-bold text-foreground tracking-tight leading-snug">
                                            {t('login_demo.ready_app_title', 'Ready to Create Your Amazing Event App?')}
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Join thousands of happy customers who trust {companyName || 'Event Invit'}.
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full space-y-2.5 pt-1 text-center">
                                    <Button
                                        size="lg"
                                        className="w-full font-bold text-white shadow-md py-2.5 rounded-xl gap-2 transition-all hover:opacity-95"
                                        style={{ backgroundColor: primaryBtn }}
                                    >
                                        Get Started Free <ArrowRight className="h-4 w-4" />
                                    </Button>
                                    <button
                                        type="button"
                                        className="text-xs font-bold hover:underline inline-block mx-auto pt-1 cursor-pointer"
                                        style={{ color: primaryBtn }}
                                    >
                                        View Pricing Plans
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// 3. Features Page (Dark Variant): Sign In & Demo Section
export function SignInDemoSection({ theme }: SectionProps) {
    const { t } = useWebsiteLanguage();
    const primaryBtn = theme?.primaryButton || '#E11D48';

    return (
        <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1280px]">
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0B0F19] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                    <div
                        className="absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-20 pointer-events-none"
                        style={{ backgroundColor: primaryBtn }}
                    />

                    <div className="space-y-2 text-left z-10">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                            Create, Share & Celebrate <br className="hidden sm:inline" />
                            Your <span style={{ color: primaryBtn }}>Special Moments</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                            {t('login_demo.banner_subtitle', "Start creating your event app today. It's easy, fast and absolutely amazing!")}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3.5 shrink-0 z-10 w-full md:w-auto justify-end">
                        <Button
                            size="lg"
                            className="font-bold text-white shadow-lg px-7 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95 border-0"
                            style={{ backgroundColor: primaryBtn }}
                        >
                            {t('login_demo.create_app_now', 'Create Your App Now')}
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="font-bold text-white border-2 bg-transparent hover:bg-white/10 px-6 py-3 rounded-xl gap-2 transition-all hover:scale-[1.02]"
                            style={{ borderColor: primaryBtn, color: '#FFFFFF' }}
                        >
                            <Smartphone className="h-4 w-4 shrink-0" style={{ color: primaryBtn }} />
                            <span className="text-white">{t('login_demo.book_demo', 'Book a Demo')}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

// 4. Pricing Page: Contact & Signup Demo Section (1:1 Match with Unsplash Support Agent & Event App Mockup Images)
export function ContactSignupDemoSection({ theme, companyName }: SectionProps) {
    const { t } = useWebsiteLanguage();
    const primaryBtn = theme?.primaryButton || '#E11D48';

    return (
        <section className="w-full py-6 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1280px]">
                <div className="flex flex-col lg:flex-row items-stretch gap-4 sm:gap-6">
                    {/* Left Card: {t('login_demo.still_questions', 'Still Have Questions?')} (Support Card with Customer Support Agent Image) */}
                    <div className="w-full lg:w-[40%] relative overflow-hidden rounded-3xl bg-[#F3F6FA] border border-slate-200/60 p-5 sm:p-6 flex items-center justify-between gap-4 shadow-xs">
                        <div className="space-y-2.5 z-10 flex-1 min-w-0">
                            <div className="space-y-1">
                                <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate sm:whitespace-normal">
                                    {t('login_demo.still_questions', 'Still Have Questions?')}
                                </h3>
                                <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-normal max-w-[210px]">
                                    {t('login_demo.still_questions_subtitle', 'We are here to help you choose the best plan for your needs.')}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="inline-flex items-center gap-1 text-xs font-bold hover:underline transition-colors cursor-pointer pt-0.5"
                                style={{ color: primaryBtn }}
                            >
                                <span>{t('login_demo.contact_support', 'Contact Support')}</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Customer Support Agent Photo / Image */}
                        <div className="shrink-0 relative z-10 flex items-center justify-center">
                            <div className="relative">
                                <img
                                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop"
                                    alt="Contact Support Agent"
                                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover shadow-md border-2 border-white ring-4 ring-primary/10"
                                />
                                <div className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white rounded-md px-1.5 py-0.5 text-[8px] font-bold shadow-xs">
                                    24/7
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Card: {t('login_demo.ready_event_title', 'Ready to Create Your Amazing Event?')} (Phone Frame with Event App Mockup Image) */}
                    <div className="w-full lg:w-[60%] relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-50/90 via-rose-50/70 to-pink-100/90 border border-pink-200/60 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
                        <div className="space-y-3 text-left z-10 flex-1 min-w-0">
                            <div className="space-y-1">
                                <h3 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-900 leading-snug">
                                    {t('login_demo.ready_event_title', 'Ready to Create Your Amazing Event?')}
                                </h3>
                                <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-normal max-w-sm">
                                    Join thousands of happy customers who trust {companyName || 'Event Invit'} for their special moments.
                                </p>
                            </div>

                            {/* 2 Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                                <Button
                                    size="sm"
                                    className="font-bold text-white shadow-md px-4 py-2 rounded-xl transition-all hover:opacity-95 text-xs border-0"
                                    style={{ backgroundColor: primaryBtn }}
                                >
                                    Get Started Free
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="font-bold px-4 py-2 rounded-xl bg-white/90 shadow-xs transition-all hover:bg-white border border-primary/50 text-xs text-slate-800"
                                    style={{ borderColor: primaryBtn }}
                                >
                                    Book a Demo
                                </Button>
                            </div>
                        </div>

                        {/* Right: Phone Frame with Real Event App Graphic */}
                        <div className="shrink-0 relative z-10 w-full sm:w-auto flex justify-center sm:justify-end">
                            <div className="relative w-[115px] sm:w-[130px] bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-xl overflow-hidden p-1 text-white transition-transform hover:scale-105 duration-300">
                                <div className="h-1 w-6 bg-slate-700 rounded-full mx-auto mb-1" />
                                <div className="relative aspect-[9/16] rounded-xl bg-white overflow-hidden shadow-inner group">
                                    <img
                                        src="/images/event-app-mockup.png"
                                        alt="Scan QR Code Invite App"
                                        className="w-full h-full object-cover object-center"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-1.5 flex flex-col justify-end items-center text-center">
                                        <div className="bg-white/90 backdrop-blur-xs rounded-lg p-1 shadow-md mb-1">
                                            <QrCode className="h-7 w-7 text-slate-900" />
                                        </div>
                                        <span className="text-[7.5px] font-extrabold text-white leading-none tracking-tight">
                                            Scan to View Invite
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// 5. How It Works Page: Signup Demo Section
export function SignupDemoSection({ theme, companyName }: SectionProps) {
    const { t } = useWebsiteLanguage();
    const primaryBtn = theme?.primaryButton || '#E11D48';

    return (
        <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1280px]">
                <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto">
                        <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-md ring-4 ring-primary/20"
                            style={{ backgroundColor: primaryBtn }}
                        >
                            <Gift className="h-7 w-7 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                                Ready to Create Your Event App?
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Join thousands of happy customers who trust {companyName || 'Event Invit'} for their special moments.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                        <Button
                            size="lg"
                            className="font-bold text-white shadow-md px-6 py-2.5 rounded-xl transition-all hover:opacity-95"
                            style={{ backgroundColor: primaryBtn }}
                        >
                            Get Started Free
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="font-bold px-6 py-2.5 rounded-xl bg-background/80 shadow-xs transition-all hover:bg-primary/10 border-2"
                            style={{ borderColor: primaryBtn, color: primaryBtn }}
                        >
                            View Demo App
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

// 6. Contact Page: Chat & Signup Demo Section (1:1 Match with Unsplash Support Mail Image)
export function ChatSignupDemoSection({ theme, companyName }: SectionProps) {
    const { t } = useWebsiteLanguage();
    const primaryBtn = theme?.primaryButton || '#E11D48';

    return (
        <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1280px]">
                <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    {/* Left: Support / Mail Envelope Image & Title/Subtitle */}
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="relative shrink-0 flex items-center justify-center">
                            <img
                                src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?q=80&w=400&auto=format&fit=crop"
                                alt="Support Chat Contact"
                                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover shadow-lg border-2 border-white ring-4 ring-primary/20"
                            />
                        </div>

                        {/* Title & Subtitle */}
                        <div className="space-y-1 text-left">
                            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                                {t('login_demo.still_questions', 'Still Have Questions?')}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                Our friendly team is here to help you with anything you need.
                            </p>
                        </div>
                    </div>

                    {/* Right: 2 Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3.5 shrink-0 w-full md:w-auto justify-end">
                        <Button
                            size="lg"
                            className="font-bold text-white shadow-md px-6 py-3 rounded-xl gap-2 transition-all hover:opacity-95 text-xs sm:text-sm flex items-center border-0"
                            style={{ backgroundColor: primaryBtn }}
                        >
                            <MessageSquare className="h-4 w-4 shrink-0 text-white" />
                            <span>{t('login_demo.start_live_chat', 'Start Live Chat')}</span>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="font-bold px-6 py-3 rounded-xl bg-background/90 shadow-xs transition-all hover:bg-primary/10 border-2 gap-2 text-xs sm:text-sm flex items-center"
                            style={{ borderColor: primaryBtn, color: primaryBtn }}
                        >
                            <Calendar className="h-4 w-4 shrink-0" style={{ color: primaryBtn }} />
                            <span>{t('login_demo.book_demo', 'Book a Demo')}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

// 7. Template Page: Custom Template Builder Banner (1:1 Match to Template Screenshot Design)
export function TemplateDemoSection({ theme, companyName }: SectionProps) {
    const { t } = useWebsiteLanguage();
    const primaryBtn = theme?.primaryButton || '#E11D48';

    return (
        <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1280px]">
                <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 sm:p-8 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        {/* Left: Mobile App Showcase Graphic (3 cols) */}
                        <div className="lg:col-span-3 flex items-center justify-center">
                            <div className="relative w-full max-w-[170px] rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-purple-500/10 border border-primary/20 p-3 flex items-center justify-center min-h-[140px] overflow-hidden group">
                                <div
                                    className="absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl opacity-30 pointer-events-none"
                                    style={{ backgroundColor: primaryBtn }}
                                />
                                <div className="relative z-10 w-full max-w-[135px] bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-1.5 text-white transition-transform group-hover:scale-105 duration-300">
                                    <div className="h-1 w-8 bg-slate-700 rounded-full mx-auto mb-1.5" />
                                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-slate-700/80 shadow-inner">
                                        <img
                                            src="/images/event-app-mockup.png"
                                            alt="Template Builder Showcase"
                                            className="w-full h-full object-cover object-center"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 p-1.5 flex flex-col justify-between pointer-events-none">
                                            <span className="font-bold text-[9px] text-white bg-slate-900/80 backdrop-blur-xs px-1.5 py-0.5 rounded-full border border-white/20 self-start">
                                                Templates
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Middle: Content & 3 Feature Checklist Badges (5 cols) */}
                        <div className="lg:col-span-5 space-y-3 text-left">
                            <div className="space-y-1">
                                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                                    {t('login_demo.cant_find_title', "Can't Find What You're Looking For?")}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    {t('login_demo.cant_find_subtitle', 'Create your own unique template with our easy drag & drop builder.')}
                                </p>
                            </div>

                            {/* 3 Feature Checklist Badges (Single Row) */}
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/80 shrink-0">
                                    <Wand2 className="h-4 w-4 shrink-0" style={{ color: primaryBtn }} />
                                    <span>{t('login_demo.fully_customizable', 'Fully Customizable')}</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/80 shrink-0">
                                    <Code className="h-4 w-4 shrink-0" style={{ color: primaryBtn }} />
                                    <span>{t('login_demo.no_coding', 'No Coding Required')}</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground/80 shrink-0">
                                    <Eye className="h-4 w-4 shrink-0" style={{ color: primaryBtn }} />
                                    <span>Preview in Real-time</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: CTA Action Buttons (4 cols) */}
                        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-3">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto font-bold text-white shadow-md px-6 py-3 rounded-xl transition-all hover:opacity-95 text-xs sm:text-sm cursor-pointer"
                                style={{ backgroundColor: primaryBtn }}
                            >
                                {t('login_demo.create_custom_template', 'Create Custom Template')}
                            </Button>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-800 hover:text-primary transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-100/60"
                            >
                                <PlayCircle className="h-4 w-4 shrink-0" style={{ color: primaryBtn }} />
                                <span>{t('login_demo.view_how_it_works', 'View How It Works')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Dynamic Login & Demo Component that respects the user's selected variant per page
export function DynamicLoginDemoSection({ pageSlug = 'home', theme, companyName }: { pageSlug?: string; theme?: any; companyName?: string }) {
    const [variant, setVariant] = React.useState<string>('');

    React.useEffect(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(`login_demo_variant_${pageSlug}`) : null;
        if (saved) {
            setVariant(saved);
        } else {
            const defaultMap: Record<string, string> = {
                home: 'variant_1',
                features: 'variant_2',
                template: 'variant_7',
                templates: 'variant_7',
                pricing: 'variant_3',
                'how-it-works': 'variant_4',
                contact: 'variant_5',
            };
            setVariant(defaultMap[pageSlug] || 'variant_1');
        }
    }, [pageSlug]);

    if (variant === 'variant_1') return <LoginDemoSection theme={theme} companyName={companyName} />;
    if (variant === 'variant_2') return <FeaturesFirstHighlightSection theme={theme} companyName={companyName} />;
    if (variant === 'variant_3') return <ContactSignupDemoSection theme={theme} companyName={companyName} />;
    if (variant === 'variant_4') return <SignupDemoSection theme={theme} companyName={companyName} />;
    if (variant === 'variant_5') return <ChatSignupDemoSection theme={theme} companyName={companyName} />;
    if (variant === 'variant_6') return <SignInDemoSection theme={theme} companyName={companyName} />;
    if (variant === 'variant_7') return <TemplateDemoSection theme={theme} companyName={companyName} />;

    return <LoginDemoSection theme={theme} companyName={companyName} />;
}
