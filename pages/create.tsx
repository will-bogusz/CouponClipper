// this is the create.tsx file

import { NextPageWithLayout } from './types';
import Layout from '@/components/component/Layout';
import { SignUpPanel } from '@/components/component/SignUpPanel';

const SignUpPage: NextPageWithLayout = () => {
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


