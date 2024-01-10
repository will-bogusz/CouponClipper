// this is the _app.tsx file

import { AppProps } from 'next/app';
import Layout from '../src/components/component/Layout';
import '../styles/globals.css';
import { NextPageWithLayout } from './types';

interface MyAppProps extends AppProps {
    Component: NextPageWithLayout;
}

function MyApp({ Component, pageProps }: MyAppProps) {
    const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

    return getLayout(<Component {...pageProps} />);
}

export default MyApp;



