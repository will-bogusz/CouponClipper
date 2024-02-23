// this is the index.tsx file

import { NextPageWithLayout } from '../src/components/lib/types';
import Layout from '../src/components/component/Layout';
import { UserDashboard } from '../src/components/component/UserDashboard';

const Dashboard: NextPageWithLayout = () => {
    return (
        <div>
            <UserDashboard />
        </div>
    );
};

// redundant, but here for clarity for future files
Dashboard.getLayout = (page) => {
    return <Layout showHeader={true} showFooter={true}>{page}</Layout>;
};

export default Dashboard;