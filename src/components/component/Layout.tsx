// this is the Layout.tsx file

import Header from './Header';
import Footer from './Footer';
import MinHeader from './MinimalHeader';

import React, { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
    showHeader?: boolean;
    showFooter?: boolean;
    showMinHeader?: boolean;
}

const Layout = ({ children, showHeader = true, showFooter = true, showMinHeader = false}: LayoutProps) => {
    return (
        <div>
            {showHeader && <Header />}
            {showMinHeader && <MinHeader />}
            <main>{children}</main>
            {showFooter && <Footer />}
        </div>
    );
};

export default Layout;
