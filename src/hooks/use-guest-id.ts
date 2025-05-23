import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * A hook to manage guest IDs for users who haven't created an account yet
 * This allows us to track their deals and migrate them later if they sign up
 */
export function useGuestId() {
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    // Check if a guest ID already exists in local storage
    const storedGuestId = localStorage.getItem('guestId');
    
    if (storedGuestId) {
      setGuestId(storedGuestId);
    } else {
      // Generate a new guest ID
      const newGuestId = uuidv4();
      localStorage.setItem('guestId', newGuestId);
      setGuestId(newGuestId);
    }
  }, []);

  return guestId;
}
