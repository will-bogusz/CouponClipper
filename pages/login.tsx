// this is the login.tsx file

import { NextPageWithLayout } from '../src/components/lib/types';
import Layout from '@/components/component/Layout';
import { LoginPanel } from '@/components/component/LoginPanel';
import { useAuth } from '@/components/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const LoginPage: NextPageWithLayout = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900" style={{ paddingBottom: '10%' }}>
            <LoginPanel />
        </div>
    );
};


LoginPage.getLayout = (page) => {
    return <Layout showHeader={false} showFooter={false} showMinHeader={true}>{page}</Layout>;
};

export default LoginPage;


