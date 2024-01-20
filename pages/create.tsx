// this is the create.tsx file

import { NextPageWithLayout } from './types';
import Layout from '@/components/component/Layout';
import { SignUpPanel } from '@/components/component/SignUpPanel';
import { useAuth } from '@/components/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const SignUpPage: NextPageWithLayout = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900" style={{ paddingBottom: '10%' }}>
            <SignUpPanel />
        </div>
    );
};


SignUpPage.getLayout = (page) => {
    return <Layout showHeader={false} showFooter={false} showMinHeader={true}>{page}</Layout>;
};

export default SignUpPage;


