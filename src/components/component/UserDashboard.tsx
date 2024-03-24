import { Button } from "@/components/ui/button"
import { GroceryAccounts } from "./GroceryAccounts"
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { usePopup } from '../context/PopupContext'

export function UserDashboard() {
  const { user } = useAuth()
  const { showMessage } = usePopup()
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('Sync')
  const [showSyncError, setShowSyncError] = useState<boolean>(false)

  useEffect(() => {
    const fetchLastSynced = async () => {
      if (user && user.token) {
        try {
          const response = await axios.post('/api/user/data', { fields: ['lastSynced'] }, { headers: { Authorization: `Bearer ${user.token}` } })
          if (response.data.lastSynced) {
            setLastSynced(new Date(response.data.lastSynced))
          }
        } catch (error) {
          console.error('Failed to fetch last synced data', error)
        }
      }
    }
    fetchLastSynced()
  }, [user])

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
  }, [lastSynced])

  const handleSyncClick = async () => {
    if (timeLeft !== 'Sync') {
      showMessage('You are only allowed one sync every 12 hours.', 'error')
      return
    }
    if (user && user.token) {
      try {
        // Fetch user data to check for linked stores and last synced time
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

        // initiate sync for each linked store
        for (const store of userData.linkedStores) {
          if (store.isLinked && store.credentials.email && store.credentials.encryptedCredentials.content) {
            const storeName = store.storeName.toLowerCase().replace(' ', '');
            const scrapeEndpoint = `/api/grocery/${storeName}`;
            // preparing data for decryption
            console.log('Decrypting credentials for:', { hash: store.credentials.encryptedCredentials, userSpecificElement: store.credentials.email });
            // decrypting the password
            const decryptionResponse = await axios.post('/api/user/decrypt', { hash: store.credentials.encryptedCredentials, userSpecificElement: store.credentials.email });
            const decryptedPassword = decryptionResponse.data.decryptedData;
            // preparing data for scrape endpoint
            console.log('Sending to scrape endpoint:', { email: {username: store.credentials.email}, password: {password: decryptedPassword}, mode: "scrape" });
            // calling the scrape endpoint
            await axios.post(scrapeEndpoint, { email: {username: store.credentials.email}, password: {password: decryptedPassword}, mode: "scrape" });
          }
        }

        // Update lastSynced date
        await axios.post('/api/user/update', 
          {
            field: 'lastSynced',
            value: new Date().toISOString(),
          }, 
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        setLastSynced(new Date());
        showMessage('Sync initiated successfully.', 'success');
      } catch (error) {
        console.error('Failed to initiate sync', error)
        showMessage('Failed to initiate sync.', 'error');
      }
    }
  }

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
          <Button onClick={handleSyncClick} className="w-full h-12 bg-blue-800 text-white text-lg rounded-lg shadow-lg transform transition duration-150 ease-in-out hover:scale-105 w-full">{timeLeft}</Button>
          {showSyncError && <p className="text-sm text-center text-red-500">You can only sync once every 12 hours.</p>}
        </div>
      </div>
    </div>
  )
}