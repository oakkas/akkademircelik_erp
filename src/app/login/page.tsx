'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined
    );
    const { t } = useLanguage();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">{t('common.appName')}</h1>
                    <p className="mt-2 text-gray-600">{t('common.enterCredentials')}</p>
                </div>

                <form action={formAction} className="space-y-4">
                    <div>
                        <Label htmlFor="email">{t('common.email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="admin@akkademircelik.com"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">{t('common.password')}</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="******"
                            required
                            minLength={6}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? t('common.signingIn') : t('common.signIn')}
                    </Button>

                    {errorMessage && (
                        <div className="text-sm text-red-500">
                            {errorMessage}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
