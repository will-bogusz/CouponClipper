import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

const storeLogos = {
  'Kroger': '/logos/kroger.png',
  'Food Lion': '/logos/food-lion.png',
  'Price Chopper': '/logos/price-chopper.png',
  'HyVee': '/logos/hyvee.png',
  'Albertsons': '/logos/albertsons.png',
  'Safeway': '/logos/safeway.png'
};

export function GroceryAccounts() {
  const { user } = useAuth(); // Get the current user from context
  const [linkedStores, setLinkedStores] = useState<Array<{ storeName: string; isLinked: boolean; isActive: boolean }>>([]);
  const router = useRouter(); // Use the useRouter hook from next/router

  useEffect(() => {
    const fetchUserAccounts = async () => {
      try {
        if (!user || !user.token) return;
        // Retrieve the token directly from the user object provided by AuthContext
        const token = user.token;
        const response = await axios.post('/api/user/data', 
          {
            fields: ['linkedStores'],
          }, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setLinkedStores(response.data.linkedStores);
      } catch (error) {
        console.error('Failed to fetch user accounts', error);
      }
    };

    fetchUserAccounts();
  }, [user]);

  const handleDisconnect = async (storeName: string) => {
    if (window.confirm(`Are you sure you want to disconnect ${storeName}?`)) {
      try {
        const updatedStores = linkedStores.map(store => {
          if (store.storeName === storeName) {
            return { ...store, isLinked: false, credentials: { email: '', encryptedPassword: '' } };
          }
          return store;
        });

        await axios.post('/api/user/update', {
          field: 'linkedStores',
          value: updatedStores,
        }, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });

        setLinkedStores(updatedStores);
      } catch (error) {
        console.error('Failed to disconnect', error);
      }
    }
  };

  const handleConnect = (storeName: string) => {
    // Redirect the user to the [company].tsx page for the selected store
    router.push(`/${storeName.replace(/\s+/g, '').toLowerCase()}`);
  };

  return (
    <div className="w-full flex flex-wrap justify-center gap-6">
      {linkedStores.map(({ storeName, isLinked, isActive }) => (
        <section key={storeName} className="p-6 bg-white rounded-lg shadow dark:bg-gray-800 sm:basis-full md:basis-1/3 md:flex-1 flex flex-col items-center">
          <div className="flex items-center space-x-3 w-full">
          <img src={storeLogos[storeName as keyof typeof storeLogos]} alt={`${storeName} logo`} className="h-10 w-10 object-contain" />
            <div className="flex-grow">
              <h2 className="text-xl font-bold">{storeName}</h2>
              <p className="text-gray-500 dark:text-gray-400">
                {isLinked ? 'Connected' : 'Not Connected'}
              </p>
            </div>
          </div>
          {isActive ? (
            isLinked ? (
              <Button onClick={() => handleDisconnect(storeName)} className="mt-4 bg-gray-200 text-gray-700 text-lg py-2 px-4 rounded-lg shadow-lg transform transition duration-150 ease-in-out hover:scale-105 w-full" variant="outline">
                Disconnect
              </Button>
            ) : (
              <Button onClick={() => handleConnect(storeName)} className="mt-4 bg-blue-500 text-white text-lg py-2 px-4 rounded-lg shadow-lg transform transition duration-150 ease-in-out hover:scale-105 w-full" variant="default">
                Connect
              </Button>
            )
          ) : (
            <p className="text-gray-500 dark:text-gray-400 mt-4 w-full text-center">Under Development</p>
          )}
        </section>
      ))}
    </div>
  );
}