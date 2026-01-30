/**
 * Jotai Store Exports
 *
 * This file exports all atoms for easy importing throughout the application.
 * Import atoms from this file to use Jotai state management.
 *
 * @example
 * import { userAtom, notificationsAtom } from '@/stores';
 * import { useAtom, useAtomValue, useSetAtom } from 'jotai';
 *
 * // Read and write
 * const [user, setUser] = useAtom(userAtom);
 *
 * // Read only
 * const notifications = useAtomValue(notificationsAtom);
 *
 * // Write only
 * const addNotification = useSetAtom(addNotificationAtom);
 */

export {
  addNotificationAtom, isAuthenticatedAtom,
  // Notification atoms
  notificationsAtom, removeNotificationAtom,
  // Theme atom
  themeAtom,
  // Auth atoms
  userAtom, type Notification, type Theme, type User
} from './atoms.js';

