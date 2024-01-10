// this is the login.tsx file

import { NextPageWithLayout } from './types';
import Layout from '../src/components/component/Layout';
import { LoginPanel } from '../src/components/component/LoginPanel';

const LoginPage: NextPageWithLayout = () => {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900" style={{ paddingBottom: '10%' }}>
            <LoginPanel />
        </div>
    );
};


LoginPage.getLayout = (page) => {
    return <Layout showHeader={false} showFooter={false}>{page}</Layout>;
};

export default LoginPage;


