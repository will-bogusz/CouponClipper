import { Button } from "@/components/ui/button";
import { GroceryAccounts } from "./GroceryAccounts";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usePopup } from '../context/PopupContext';

export function UserDashboard() {
  const { user } = useAuth();
  const { showMessage } = usePopup();
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('Sync');
  const [showSyncError, setShowSyncError] = useState<boolean>(false);

  useEffect(() => {
    const fetchLastSynced = async () => {
      if (user && user.token) {
        try {
          const response = await axios.post('/api/user/data', { fields: ['lastSynced'] }, { headers: { Authorization: `Bearer ${user.token}` } });
          if (response.data.lastSynced) {
            setLastSynced(new Date(response.data.lastSynced));
          }
        } catch (error) {
          console.error('Failed to fetch last synced data', error);
        }
      }
    };
    fetchLastSynced();
  }, [user]);

  useEffect(() => {
    const updateSyncButtonLabel = () => {
      if (!lastSynced) {
        setTimeLeft('Sync');
        return;
      }
      const now = new Date();
      const diff = now.getTime() - lastSynced.getTime();
      const twelveHours = 12 * 60 * 60 * 1000;
      if (diff < twelveHours) {
        const hoursLeft = Math.floor((twelveHours - diff) / (60 * 60 * 1000));
        const minutesLeft = Math.floor(((twelveHours - diff) % (60 * 60 * 1000)) / (60 * 1000));
        const secondsLeft = Math.floor(((twelveHours - diff) % (60 * 1000)) / 1000);
        setTimeLeft(`Wait ${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`);
      } else {
        setTimeLeft('Sync');
      }
    };

    const interval = setInterval(updateSyncButtonLabel, 1000);
    updateSyncButtonLabel(); // initial update

    return () => clearInterval(interval);
  }, [lastSynced]);

  const handleSyncClick = async () => {
    if (timeLeft !== 'Sync') {
      showMessage('You are only allowed one sync every 12 hours.', 'error');
      return;
    }
    if (user && user.token) {
      try {
        const userDataResponse = await axios.post('/api/user/data', 
          {
            fields: ['linkedStores', 'lastSynced'],
          }, 
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const userData = userDataResponse.data;

        if (!userData || !userData.linkedStores) {
          console.log('User data or linked stores not found');
          showMessage('User data not found', 'error');
          return;
        }

        const now = new Date();
        if (userData.lastSynced && (now.getTime() - new Date(userData.lastSynced).getTime()) < 12 * 60 * 60 * 1000) {
          console.log('Sync already performed in the last 12 hours');
          showMessage('Sync already performed in the last 12 hours', 'error');
          return;
        }

        // initiate sync for each linked store and track success
        const syncAttempts = userData.linkedStores.filter((store: { isLinked: any; credentials: { email: any; encryptedCredentials: { content: any; }; }; }) => store.isLinked && store.credentials.email && store.credentials.encryptedCredentials.content);
        const syncPromises = syncAttempts.map(async (store: { storeName: string; credentials: { encryptedCredentials: any; email: any; }; }) => {
          const storeName = store.storeName.toLowerCase().replace(' ', '');
          const scrapeEndpoint = `/api/grocery/${storeName}`;
          try {
            const decryptionResponse = await axios.post('/api/user/decrypt', { hash: store.credentials.encryptedCredentials, userSpecificElement: store.credentials.email });
            const decryptedPassword = decryptionResponse.data.decryptedData;
            const scrapeResponse = await axios.post(scrapeEndpoint, { email: {username: store.credentials.email}, password: {password: decryptedPassword}, mode: "scrape" });
            
            // handling scrape endpoint response
            if (scrapeResponse.data.status === 'success') {
              const message = `${store.storeName}: ${scrapeResponse.data.clipped} coupons clipped successfully.`;
              showMessage(message, 'success');
              return true;
            } else {
              // if the scrape was not a complete success, use the message from the response
              const message = `${store.storeName}: ${scrapeResponse.data.message}`;
              showMessage(message, 'error');
              return false;
            }
          } catch (error) {
            console.error(`Error syncing store ${store.storeName}:`, error);
            showMessage(`${store.storeName}: Failed to sync.`, 'error');
            return false;
          }
        });

        Promise.all(syncPromises).then((results) => {
          const allSuccessful = results.every(result => result === true);
          const attemptedSyncs = syncAttempts.length;
          const successfulSyncs = results.filter(result => result === true).length;
          if (allSuccessful && attemptedSyncs === successfulSyncs) {
            showMessage('All stores synced successfully.', 'success');
          } else if (successfulSyncs > 0) {
            showMessage(`${successfulSyncs}/${attemptedSyncs} stores synced successfully.`, 'success');
          } else {
            showMessage('Some stores failed to sync.', 'error');
          }
        });

        // // update lastSynced time
        // axios.post('/api/user/update', 
        //   {
        //     field: 'lastSynced',
        //     value: new Date().toISOString(),
        //   }, 
        //   {
        //     headers: {
        //       Authorization: `Bearer ${user.token}`,
        //     },
        //   }
        // ).then(() => {
        //   setLastSynced(new Date());
        // }).catch((error) => {
        //   console.error('Failed to update last synced time', error);
        // });
      } catch (error) {
        console.error('Failed to initiate sync', error);
        showMessage('Failed to initiate sync.', 'error');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-3xl p-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">Linked Grocery Accounts</h2>
        <div className="mt-8 grid gap-4">
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-inner dark:bg-gray-700">
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <GroceryAccounts />
            </div>
          </div>
          <Button onClick={handleSyncClick} className="w-full h-12 bg-blue-800 text-white text-lg rounded-lg shadow-lg transform transition duration-150 ease-in-out hover:scale-105">{timeLeft}</Button>
          {showSyncError && <p className="text-sm text-center text-red-500">You can only sync once every 12 hours.</p>}
        </div>
      </div>
    </div>
  );
}
