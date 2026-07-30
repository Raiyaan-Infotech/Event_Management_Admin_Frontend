'use client';

import * as React from 'react';
import { ArrowRight, CheckCircle2, Sparkles, MessageCircle, PlayCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SectionProps {
    theme?: any;
    companyName?: string;
}

// 1. Home Page: Login & Demo Section
export function LoginDemoSection({ theme, companyName }: SectionProps) {
    const primaryBtn = theme?.primaryButton || '#7C3AED';

    return (
        <section className="w-full bg-slate-900 py-16 text-white relative overflow-hidden">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl bg-slate-800/80 border border-slate-700/60 p-8 sm:p-12 shadow-2xl">
                    <div className="lg:col-span-8 space-y-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary-foreground border border-primary/30">
                            <Sparkles className="h-3.5 w-3.5" /> Ready to Create Your Event App?
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                            Create, Share & Celebrate
                        </h2>
                        <p className="text-sm text-slate-300 max-w-xl">
                            Join thousands of event planners using {companyName || 'our platform'} to design gorgeous invitations, manage guests, and create unforgettable event apps.
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <Button size="lg" className="font-bold text-white shadow-lg gap-2" style={{ backgroundColor: primaryBtn }}>
                                Start Free Trial <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-700 font-semibold gap-2">
                                <PlayCircle className="h-4 w-4 text-emerald-400" /> Watch Live Demo
                            </Button>
                        </div>
                    </div>
                    <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
                        <div className="rounded-xl bg-slate-900/90 border border-slate-700 p-6 text-center space-y-3 w-full max-w-xs shadow-xl">
                            <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto" />
                            <h4 className="text-sm font-bold text-white">Instant Account Setup</h4>
                            <p className="text-xs text-slate-400">No credit card required. 14-day free access to all features.</p>
                            <Button size="sm" className="w-full text-xs font-bold text-slate-900 bg-white hover:bg-slate-100">
                                Apply Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// 2. Features Page: Sign In & Demo Section
export function SignInDemoSection({ theme }: SectionProps) {
    const primaryBtn = theme?.primaryButton || '#7C3AED';

    return (
        <section className="w-full bg-slate-50 py-14 border-t border-b">
            <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 text-center space-y-6">
                <div className="max-w-2xl mx-auto space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Experience All Features Live</h2>
                    <p className="text-xs text-slate-600">Sign in to your dashboard or request a guided demo with our feature experts.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button size="lg" className="font-bold text-white gap-2" style={{ backgroundColor: primaryBtn }}>
                        Sign In Now <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button size="lg" variant="outline" className="font-semibold gap-2">
                        Schedule Demo Call
                    </Button>
                </div>
            </div>
        </section>
    );
}

// 3. Pricing Page: Contact & Signup Demo Section
export function ContactSignupDemoSection({ theme }: SectionProps) {
    const primaryBtn = theme?.primaryButton || '#7C3AED';

    return (
        <section className="w-full bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 py-16 text-white">
            <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2 text-left">
                    <h2 className="text-2xl font-black text-white">Need Custom Enterprise Pricing?</h2>
                    <p className="text-xs text-slate-300">Get a personalized demo and dedicated account manager for large scale events.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Button size="lg" className="font-bold text-white gap-2" style={{ backgroundColor: primaryBtn }}>
                        Contact Sales
                    </Button>
                    <Button size="lg" variant="secondary" className="font-bold text-slate-900 bg-white hover:bg-slate-100">
                        Sign Up For Demo
                    </Button>
                </div>
            </div>
        </section>
    );
}

// 4. How It Works Page: Signup Demo Section
export function SignupDemoSection({ theme }: SectionProps) {
    return (
        <section className="w-full bg-white py-14 border-t">
            <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 text-center space-y-4">
                <h2 className="text-xl font-bold text-slate-900">See How Easy It Is In Action</h2>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">Watch our 2-minute walkthrough or test the platform live yourself right now.</p>
                <div className="pt-2 flex justify-center gap-3">
                    <Button className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                        Signup For Demo
                    </Button>
                </div>
            </div>
        </section>
    );
}

// 5. Contact Page: Chat & Signup Demo Section
export function ChatSignupDemoSection({ theme }: SectionProps) {
    return (
        <section className="w-full bg-slate-900 text-white py-12">
            <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Have questions before joining?</h4>
                        <p className="text-xs text-slate-400">Our support team is online 24/7 to answer your questions live.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" className="text-white border-slate-700 hover:bg-slate-800">
                        Chat With Us
                    </Button>
                    <Button size="sm" className="bg-primary text-primary-foreground font-bold">
                        Signup Demo
                    </Button>
                </div>
            </div>
        </section>
    );
}
