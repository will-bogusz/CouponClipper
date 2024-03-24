// _app.tsx

import { AppProps } from 'next/app';
import Layout from '@/components/component/Layout';
import '../styles/globals.css';
import { NextPageWithLayout } from '../src/components/lib/types';
import { AuthProvider } from '@/components/context/AuthContext';
import { PopupProvider } from '@/components/context/PopupContext';

interface MyAppProps extends AppProps {
    Component: NextPageWithLayout;
}

function MyApp({ Component, pageProps }: MyAppProps) {
    const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

    // Wrap the layout with AuthProvider and PopupProvider
    return (
        <AuthProvider>
            <PopupProvider>
                {getLayout(<Component {...pageProps} />)}
            </PopupProvider>
        </AuthProvider>
    );
}

export default MyApp;