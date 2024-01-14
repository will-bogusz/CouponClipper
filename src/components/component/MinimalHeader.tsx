// src/components/component/MinimalHeader.tsx
import Link from 'next/link';

const MinimalHeader = () => {
  return (
    <header className="flex items-center justify-center px-6 py-4 bg-white dark:bg-gray-800">
      <Link href="/">
        <h1 className="text-3xl font-bold cursor-pointer">Clipwise</h1>
      </Link>
    </header>
  );
};

export default MinimalHeader;