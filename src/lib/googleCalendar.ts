import { supabase } from "./supabaseClient";

export const connectGoogleCalendar = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
      scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  });

  if (error) throw error;
  return data;
};

export const getCalendarEvents = async () => {
  // Get the session to retrieve the provider token
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.provider_token) {
    throw new Error('No Google provider token found');
  }

  // Fetch events from Google Calendar API
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=' + new Date().toISOString() + '&maxResults=10&singleEvents=true&orderBy=startTime',
    {
      headers: {
        'Authorization': `Bearer ${session.provider_token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.items || [];
};

export const createCalendarEvent = async (event: { title: string; description?: string; startTime: string; endTime: string; location?: string }) => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.provider_token) {
    // Fail silently or throw, but here we want to be explicit if called
    throw new Error('No Google provider token found');
  }

  const eventBody = {
    summary: event.title,
    description: event.description,
    location: event.location,
    start: {
      dateTime: event.startTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: event.endTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.provider_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventBody)
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data;
};
