import {useEffect, useState} from 'react';

/** Default pause before a typed search term is considered settled. */
export const SEARCH_DELAY = 350;

/**
 * Returns `value` only once it has stopped changing for `delay` ms — keeps a
 * keystroke from becoming a request.
 */
export const useDebouncedValue = (value, delay = SEARCH_DELAY) => {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return settled;
};

export default useDebouncedValue;
