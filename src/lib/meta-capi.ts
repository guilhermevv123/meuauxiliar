import { v4 as uuidv4 } from 'uuid';

const CAPI_TOKEN = import.meta.env.VITE_META_CAPI_TOKEN;
const PIXEL_ID = '884063954329767';
const API_VERSION = 'v19.0';

type CapiEventName = 'PageView' | 'Lead' | 'InitiateCheckout' | 'AddToCart' | 'Purchase';

interface CapiEventData {
  eventName: CapiEventName;
  eventId: string; // CRITICAL for deduplication
  sourceUrl: string;
  userData?: {
    em?: string; // hashed email
    ph?: string; // hashed phone
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string;
    fbp?: string;
  };
  customData?: any;
}

export const sendCapiEvent = async (eventData: CapiEventData) => {
  if (!CAPI_TOKEN) {
    console.warn('Meta CAPI Token not found');
    return;
  }

  // Check for test_event_code in URL
  const urlParams = new URLSearchParams(window.location.search);
  const testEventCode = urlParams.get('test_event_code');

  const payload = {
    data: [
      {
        event_name: eventData.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: eventData.sourceUrl,
        event_id: eventData.eventId,
        action_source: 'website',
        user_data: {
          client_user_agent: navigator.userAgent,
          ...eventData.userData
        },
        custom_data: eventData.customData
      }
    ]
  };

  // Add test_event_code if it exists
  if (testEventCode) {
    // @ts-ignore
    payload.test_event_code = testEventCode;
  }

  try {
    // Note: Calling Graph API directly from client-side exposes the token in Network Tab
    // This is a tradeoff for serverless architecture without backend proxy
    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${CAPI_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('CAPI Error:', error);
    }
  } catch (err) {
    console.error('Failed to send CAPI event', err);
  }
};

export const generateEventId = () => {
    return uuidv4();
};
