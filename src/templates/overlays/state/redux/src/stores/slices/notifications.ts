import { generateId } from '@/lib/utils';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Notifications slice following bulletproof-react patterns
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
};

type NotificationsState = {
  notifications: Notification[];
};

const initialState: NotificationsState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id'>>
    ) => {
      const notification = {
        ...action.payload,
        id: generateId(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationsSlice.actions;

export const notificationsReducer = notificationsSlice.reducer;

// Selectors
export const selectNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications;

