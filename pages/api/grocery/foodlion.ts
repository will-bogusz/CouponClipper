import type { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password, mode } = req.body;
  const emailToPass = email.username;
  const passwordToPass = password.password;

  const apiKey = process.env.SCRAPE_API_KEY;
  const sessionName = Array.from({length: 16}, () => Math.floor(Math.random() * 10)).join('');

  async function attemptFetch(url: string, options = {}, maxAttempts = 3) {
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        console.log(`Attempt ${attempts + 1} to fetch data from URL: ${url}`);
        const response = await fetch(url, options);
        if (response.ok) {
          console.log(`Fetch attempt ${attempts + 1} successful.`);
          return response;
        }
        console.log(`Fetch attempt ${attempts + 1} failed with response status: ${response.status}`);
        throw new Error('Response not OK');
      } catch (error) {
        console.log(`Fetch attempt ${attempts + 1} failed with error: ${error}`);
        attempts++;
        if (attempts >= maxAttempts) {
          console.log(`Max fetch attempts reached for URL: ${url}`);
          throw new Error('Max fetch attempts reached');
        }
      }
    }
  }

  const url = `https://api.scrapfly.io/scrape?retry=false&tags=player%2Cproject%3Adefault&session=${sessionName}&proxy_pool=public_residential_pool&country=us&lang=en&asp=true&key=${apiKey}&url=https%3A%2F%2Ffoodlion.com%2F`;
  try {
    await attemptFetch(url); // Just to prime the session, no need to handle the response
  } catch (error) {
    console.error('Error fetching initial data:', error);
    res.status(200).json({ status: 'failure', message: 'Failed to fetch initial data after multiple attempts' });
    return;
  }

  const loginUrl = `https://api.scrapfly.io/scrape?retry=false&tags=player%2Cproject%3Adefault&session=${sessionName}&proxy_pool=public_residential_pool&country=us&lang=en&asp=true&key=${apiKey}&url=https%3A%2F%2Ffoodlion.com%2Fapi%2Fv6.0%2Fuser%2Fguest%2Ftransfer&headers[Content-Type]=application%2Fjson%3Bcharset%3DUTF-8`;
  const loginPayload = JSON.stringify({ loginName: emailToPass, password: passwordToPass });
  const loginOptions = {
    method: 'PUT',
    body: loginPayload
  };

  let loginResponse;
  try {
    loginResponse = await attemptFetch(loginUrl, loginOptions);
  } catch (error) {
    console.error('Error during login:', error);
    res.status(200).json({ status: 'failure', message: 'Failed to login after multiple attempts' });
    return;
  }

  if (!loginResponse) {
    console.log('Login response is undefined');
    res.status(200).json({ status: 'failure', message: 'Login response is undefined' });
    return;
  }
  let loginDataText = await loginResponse.text();
  let loginData;
  try {
    loginData = JSON.parse(loginDataText);
  } catch (error) {
    console.error('Failed to parse login response as JSON:', error);
    res.status(500).json({ status: 'failure', message: 'Failed to parse login response' });
    return;
  }
  console.log('Login response data:', loginData);
  const contentObject = JSON.parse(loginData.result.content);
  console.log('Parsed content object:', contentObject);
  const responseCode = contentObject.response.result;
  console.log('Response code:', responseCode);

  if (responseCode === "SUCCESS") {
    if (mode === 'validate') {
      res.status(200).json({ status: 'success', message: 'Login successful' });
      return;
    } else if (mode === 'scrape') {
      const userUrl = `https://api.scrapfly.io/scrape?retry=false&tags=player%2Cproject%3Adefault&session=${sessionName}&proxy_pool=public_residential_pool&country=us&lang=en&asp=true&key=${apiKey}&url=https%3A%2F%2Ffoodlion.com%2Fapi%2Fv1.0%2Fcurrent%2Fuser`;

      let userDataResponse;
      try {
        userDataResponse = await attemptFetch(userUrl);
      } catch (error) {
        console.error('Error grabbing user data:', error);
        res.status(200).json({ status: 'failure', message: 'Failed to grab user data after multiple attempts' });
        return;
      }

      if (!userDataResponse) {
        res.status(404).json({ status: 'failure', message: 'User data response is undefined' });
        return;
      }

      let userDataText = await userDataResponse.text();
      let userData;
      try {
        userData = JSON.parse(userDataText);
        userData = JSON.parse(userData.result.content); // Adjusted to parse the wrapper
      } catch (error) {
        console.error('Failed to parse user data response as JSON:', error);
        res.status(500).json({ status: 'failure', message: 'Failed to parse user data response' });
        return;
      }
      console.log('User data:', userData);
      if (!userData.userId) {
        res.status(404).json({ status: 'failure', message: 'User ID not found in response' });
        return;
      }
      const userId = userData.userId;
      console.log('User ID:', userId);

      const profileUrl = `https://api.scrapfly.io/scrape?retry=false&tags=player%2Cproject%3Adefault&session=${sessionName}&proxy_pool=public_residential_pool&country=us&lang=en&asp=true&key=${apiKey}&url=https%3A%2F%2Ffoodlion.com%2Fapi%2Fv4.0%2Fuser%2F${userId}%2Fprofile`;

      let profileResponse, cardNumber;
      try {
        profileResponse = await attemptFetch(profileUrl);
        console.log('Profile response received:', profileResponse);
        if (profileResponse) {
          let profileDataText = await profileResponse.text();
          let profileData;
          try {
            profileData = JSON.parse(profileDataText);
            profileData = JSON.parse(profileData.result.content); // Adjusted to parse the wrapper
          } catch (error) {
            console.error('Failed to parse profile data as JSON:', error);
            res.status(500).json({ status: 'failure', message: 'Failed to parse profile data' });
            return;
          }
          console.log('Profile data parsed:', profileData);
          if (profileData && profileData.response && profileData.response.retailerCard && profileData.response.retailerCard.cardNumber) {
            cardNumber = profileData.response.retailerCard.cardNumber;
            console.log('Card number found:', cardNumber);
          } else {
            console.error('Card number not found in profile data');
            res.status(404).json({ status: 'failure', message: 'Card number not found in profile response' });
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(200).json({ status: 'failure', message: 'Failed to fetch profile data after multiple attempts' });
        return;
      }

      if (!cardNumber) {
        console.error('Card number is undefined after fetching profile data');
        res.status(404).json({ status: 'failure', message: 'Card number not found' });
        return;
      }

      const couponUrl = `https://api.scrapfly.io/scrape?retry=false&tags=player%2Cproject%3Adefault&session=${sessionName}&proxy_pool=public_residential_pool&country=us&lang=en&asp=true&key=${apiKey}&url=https%3A%2F%2Ffoodlion.com%2Fapi%2Fv7.0%2Fcoupons%2Fusers%2F${userId}%2Fprism%2Fservice-locations%2F50000806%2Fcoupons%2Fsearch%3FfullDocument%3Dtrue%26unwrap%3Dtrue&headers[Content-Type]=application%2Fjson%3Bcharset%3DUTF-8`;

      let coupons: {id: string, clipped: boolean}[] = [];
      let start = 0;
      let total = 0;
      do {
        let couponPayload = JSON.stringify({
          "query": {"start": start, "size": 90},
          "filter": {"loadable": true, "loaded": false, "sourceSystems": ["QUO", "COP"]},
          "copientQuotientTargetingEnabled": true,
          "cardNumber": cardNumber,
          "sorts": [{"targeted": "desc"}]
        });

        const couponOptions = {
          method: 'POST',
          body: couponPayload
        };

        let couponResponse;
        try {
          couponResponse = await attemptFetch(couponUrl, couponOptions);
          console.log('Coupon response received:', couponResponse);
          if (!couponResponse) {
            throw new Error('Coupon response is undefined');
          }
          let couponDataText = await couponResponse.text();
          let couponData;
          try {
            couponData = JSON.parse(couponDataText);
            couponData = JSON.parse(couponData.result.content); // Adjusted to parse the wrapper
          } catch (error) {
            console.error('Failed to parse coupon data as JSON:', error);
            res.status(500).json({ status: 'failure', message: 'Failed to parse coupon data' });
            return;
          }
          console.log('Coupon data parsed:', couponData);
          total = couponData.paging.total;
          console.log('Total coupons found:', total);
          start += 90;
          const unclippedCoupons = couponData.coupons.filter((coupon: any) => !coupon.clipped).map((coupon: any) => ({id: coupon.id, clipped: coupon.clipped}));
          coupons = coupons.concat(unclippedCoupons);
          console.log('Unclipped coupons collected:', unclippedCoupons);
        } catch (error) {
          console.error('Error fetching coupons:', error);
          res.status(200).json({ status: 'failure', message: 'Failed to fetch coupons after multiple attempts' });
          return;
        }
      } while (start < total);

      const clipUrl = `https://api.scrapfly.io/scrape?retry=false&tags=player%2Cproject%3Adefault&session=${sessionName}&proxy_pool=public_residential_pool&country=us&lang=en&asp=true&key=${apiKey}&url=https%253A%252F%252Ffoodlion.com%252Fapi%252Fv6.0%252Fusers%252F${userId}%252Fcoupons%252Fclipped&headers[Content-Type]=application%2Fjson%3Bcharset%3DUTF-8`;

      let clippedCouponsCount = 0;
      for (const coupon of coupons) {
        let clipPayload = JSON.stringify({ couponId: coupon.id });
        try {
          console.log(`Attempting to clip coupon ${coupon.id}`);
          const response = await fetch(clipUrl, {
            method: 'POST',
            body: clipPayload
          });
          let dataText = await response.text();
          let data;
          try {
            data = JSON.parse(dataText);
            data = JSON.parse(data.result.content); // Adjusted to parse the wrapper
          } catch (error) {
            console.error(`Failed to parse clip response for coupon ${coupon.id} as JSON:`, error);
            continue;
          }
          console.log(`Clip response for coupon ${coupon.id}:`, data);
          if (data.response && data.response.result === "SUCCESS") {
            console.log(`Coupon ${coupon.id} clipped successfully.`);
            clippedCouponsCount++;
          } else {
            console.log(`Failed to clip coupon ${coupon.id}.`);
          }
        } catch (error) {
          console.log(`Error clipping coupon ${coupon.id}:`, error);
        }
      }

      console.log(`Total coupons clipped: ${clippedCouponsCount}`);
      res.status(200).json({ status: 'success', message: `Scraping and coupon redemption successful. Total coupons clipped: ${clippedCouponsCount}` });
      return;
    }
  } else if (responseCode === "LOGIN_INVALID") {
    res.status(200).json({ status: 'failure', message: 'Login invalid' });
  } else {
    res.status(500).json({ status: 'failure', message: 'An unexpected error occurred' });
  }
  return;
}
