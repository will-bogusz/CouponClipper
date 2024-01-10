// this is the Layout.tsx file

import Header from './Header';
import Footer from './Footer';

import React, { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
    showHeader?: boolean;
    showFooter?: boolean;
}

const Layout = ({ children, showHeader = true, showFooter = true }: LayoutProps) => {
    return (
        <div>
            {showHeader && <Header />}
            <main>{children}</main>
            {showFooter && <Footer />}
        </div>
    );
};

export default Layout;
