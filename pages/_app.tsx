// _app.tsx

import { AppProps } from 'next/app';
import Layout from '@/components/component/Layout';
import '../styles/globals.css';
import { NextPageWithLayout } from './types';
import { AuthProvider } from '@/components/context/AuthContext';

interface MyAppProps extends AppProps {
    Component: NextPageWithLayout;
}

function MyApp({ Component, pageProps }: MyAppProps) {
    const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

    // Wrap the layout with AuthProvider
    return (
        <AuthProvider>
            {getLayout(<Component {...pageProps} />)}
        </AuthProvider>
    );
}

export default MyApp;