import { NextPageWithLayout } from '../src/components/lib/types';
import Layout from '@/components/component/Layout';
import { KrogerLoginPanel } from '@/components/component/groceryLogins/KrogerLoginPanel';
import { FoodLionLoginPanel } from '@/components/component/groceryLogins/FoodLionLoginPanel';
import { useAuth } from '@/components/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import axios from 'axios';

const GroceryLoginPage: NextPageWithLayout = () => {
    const { user } = useAuth();
    const router = useRouter();
    const { query } = useRouter();
    const company = query.company as string | undefined;

    // function to normalize company names for comparison
    const normalizeCompanyName = (name: string | undefined) => {
        return name ? name.replace(/\s+/g, '').toLowerCase() : '';
    };

    useEffect(() => {
        const checkCompanyStatus = async () => {
            if (!user || !user.token || !company) return;
            try {
                const response = await axios.post('/api/user/data', 
                    {
                        fields: ['linkedStores'],
                    }, 
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    }
                );
                const linkedStores = response.data.linkedStores;
                const currentCompany = linkedStores.find((store: { storeName: string; }) => normalizeCompanyName(store.storeName) === normalizeCompanyName(company));
                if (currentCompany && (currentCompany.isActive === false || currentCompany.isLinked === true)) {
                    router.push('/dashboard');
                }
            } catch (error) {
                console.error('Failed to fetch company status', error);
            }
        };

        checkCompanyStatus();
    }, [user, company, router]);

    const renderLoginPanel = () => {
        const normalizedCompany = normalizeCompanyName(company);
        switch (normalizedCompany) {
            case 'kroger':
                return <KrogerLoginPanel />;
            case 'foodlion':
                return <FoodLionLoginPanel />;
            default:
                return <div>Invalid company</div>;
        }
    };

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900" style={{ paddingBottom: '10%' }}>
            {renderLoginPanel()}
        </div>
    );
};

GroceryLoginPage.getLayout = (page) => {
    return <Layout showHeader={false} showFooter={false} showMinHeader={true}>{page}</Layout>;
};

export default GroceryLoginPage;
