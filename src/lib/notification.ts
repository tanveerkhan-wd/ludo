import prisma from './prisma';
import { NotificationType } from '@prisma/client';

export const notificationService = {
  /**
   * Create a notification for a user
   */
  async create({
    userId,
    title,
    message,
    type,
    link,
    metadata,
  }: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
    metadata?: any;
  }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          link,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      // TODO: Emit socket event for real-time update
      // if (global.io) {
      //   global.io.to(`user:${userId}`).emit('notification:new', notification);
      // }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  /**
   * Create notifications for multiple users
   */
  async createMany({
    userIds,
    title,
    message,
    type,
    link,
    metadata,
  }: {
    userIds: string[];
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
    metadata?: any;
  }) {
    try {
      const data = userIds.map((userId) => ({
        userId,
        title,
        message,
        type,
        link,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }));

      await prisma.notification.createMany({
        data,
      });

      // TODO: Emit socket events
      
      return true;
    } catch (error) {
      console.error('Error creating many notifications:', error);
      return false;
    }
  },

  /**
   * Send notification to all users
   */
  async notifyAll({
    title,
    message,
    type,
    link,
    metadata,
  }: {
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
    metadata?: any;
  }) {
    try {
      const users = await prisma.user.findMany({ select: { id: true } });
      const userIds = users.map((u) => u.id);
      return this.createMany({ userIds, title, message, type, link, metadata });
    } catch (error) {
      console.error('Error notifying all users:', error);
      return false;
    }
  },

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  },

  /**
   * Clear all notifications for a user
   */
  async clearAll(userId: string) {
    return prisma.notification.deleteMany({
      where: {
        userId,
      },
    });
  },
};
