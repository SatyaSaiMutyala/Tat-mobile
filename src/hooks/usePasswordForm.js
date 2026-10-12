import {useCallback, useMemo, useState} from 'react';

/** Matches the API's `Password::min(8)` rule. */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * State and validation shared by the two password screens — the forced change
 * after a temp password, and the voluntary one under More.
 *
 * Both must agree on the rules, so the rules live here rather than in either
 * screen. Chrome (dark auth layout vs in-app screen) stays with the screens.
 */
export const usePasswordForm = () => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);

  const errors = useMemo(
    () => ({
      current: touched && !current ? 'Enter your current password' : '',
      next:
        touched && next.length < MIN_PASSWORD_LENGTH
          ? `Use at least ${MIN_PASSWORD_LENGTH} characters`
          : '',
      // The API rejects reusing the old password; catching it here saves a
      // round trip and reads better than a server error.
      reuse:
        touched && current && next && current === next
          ? 'Choose a password you have not used here'
          : '',
      confirm: touched && confirm !== next ? 'Passwords do not match' : '',
    }),
    [touched, current, next, confirm],
  );

  const valid =
    Boolean(current) &&
    next.length >= MIN_PASSWORD_LENGTH &&
    current !== next &&
    confirm === next;

  const reset = useCallback(() => {
    setCurrent('');
    setNext('');
    setConfirm('');
    setTouched(false);
  }, []);

  return {
    values: {current, next, confirm},
    setCurrent,
    setNext,
    setConfirm,
    touched,
    setTouched,
    errors,
    valid,
    reset,
    /** Shaped for `changePassword` / `changePasswordRequest`. */
    payload: {
      currentPassword: current,
      password: next,
      passwordConfirmation: confirm,
    },
  };
};

export default usePasswordForm;
