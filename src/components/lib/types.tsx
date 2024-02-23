import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';

// Extend NextPage to include an optional getLayout function
export type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement) => ReactNode;
};
