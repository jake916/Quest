import React, { useEffect } from 'react';

const OneSignalInit = () => {
  useEffect(() => {
    if (window.__oneSignalInitialized) {
      // Already initialized, skip
      return;
    }

    window.__oneSignalInitialized = true;

    // Define OneSignal stub if not defined
    window.OneSignal = window.OneSignal || [];

    // Load OneSignal SDK script only if not already loaded
    if (!document.querySelector('script[src="https://cdn.onesignal.com/sdks/OneSignalSDK.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        window.OneSignal.push(function() {
          window.OneSignal.init({
            appId: "f97a813f-88fb-4026-b3dd-c957fe4ee476",
            notifyButton: {
              enable: true,
            },
            allowLocalhostAsSecureOrigin: true,
          });

          window.OneSignal.on('subscriptionChange', function (isSubscribed) {
            if (isSubscribed) {
              window.OneSignal.getUserId(function(playerId) {
                if (playerId) {
                  // Send playerId to backend
                  const token = localStorage.getItem('token');
                  if (token) {
                    fetch('/api/user/onesignal-player-id', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ oneSignalPlayerId: playerId })
                    }).catch(err => {
                      console.error('Failed to update OneSignal player ID:', err);
                    });
                  }
                }
              });
            }
          });
        });
      };
    } else {
      // Script already loaded, just init OneSignal
      window.OneSignal.push(function() {
        window.OneSignal.init({
          appId: "f97a813f-88fb-4026-b3dd-c957fe4ee476",
          notifyButton: {
            enable: true,
          },
          allowLocalhostAsSecureOrigin: true,
        });

        window.OneSignal.on('subscriptionChange', function (isSubscribed) {
          if (isSubscribed) {
            window.OneSignal.getUserId(function(playerId) {
              if (playerId) {
                // Send playerId to backend
                const token = localStorage.getItem('token');
                if (token) {
                  fetch('/api/user/onesignal-player-id', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ oneSignalPlayerId: playerId })
                  }).catch(err => {
                    console.error('Failed to update OneSignal player ID:', err);
                  });
                }
              }
            });
          }
        });
      });
    }

    // Handle hot module replacement (HMR) to avoid re-initialization
    if (import.meta.hot) {
      import.meta.hot.accept();
      import.meta.hot.dispose(() => {
        // Do not reset __oneSignalInitialized to prevent re-init on HMR
      });
    }

  }, []);

  return null;
};

export default OneSignalInit;
