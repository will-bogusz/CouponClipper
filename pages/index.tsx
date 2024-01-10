// this is the index.tsx file

import { NextPageWithLayout } from './types';
import Layout from '../src/components/component/Layout';
import LandingPage from '../src/components/component/LandingPage';

const HomePage: NextPageWithLayout = () => {
    return (
        <div>
            <LandingPage />
        </div>
    );
};

// redundant, but here for clarity for future files
HomePage.getLayout = (page) => {
    return <Layout showHeader={true} showFooter={true}>{page}</Layout>;
};

export default HomePage;


