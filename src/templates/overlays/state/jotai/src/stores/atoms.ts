import { atom } from 'jotai';

/**
 * Auth atoms for user authentication state
 */
export interface User {
  id: string;
  email: string;
  name: string;
}

export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);

/**
 * Notification atoms for app-wide notifications
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
}

export const notificationsAtom = atom<Notification[]>([]);

// Derived atom to add a notification
export const addNotificationAtom = atom(
  null,
  (get, set, notification: Omit<Notification, 'id'>) => {
    const id = crypto.randomUUID();
    set(notificationsAtom, [...get(notificationsAtom), { ...notification, id }]);
  }
);

// Derived atom to remove a notification
export const removeNotificationAtom = atom(
  null,
  (get, set, id: string) => {
    set(
      notificationsAtom,
      get(notificationsAtom).filter((n) => n.id !== id)
    );
  }
);

/**
 * Theme atom for dark/light mode
 */
export type Theme = 'light' | 'dark' | 'system';
export const themeAtom = atom<Theme>('system');

