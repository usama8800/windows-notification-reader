import { XMLParser } from 'fast-xml-parser';
import { readFileSync } from 'fs';
import path from 'path';
import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import { setTimeout } from 'timers/promises';

type Notification = {
  id: number;
  order: number;
  handlerId: number;
  application: string;
  parent: string;
  handlerType: 'app:system' | 'app:immersive' | 'app:desktop';
  type: 'toast' | 'tile' | 'badge' | 'toastCondensed';
  payload: Uint8Array;
  payloadType: 'Xml';
  tag: string;
  group: string;
  arrivalTime: string;
  expiryTime: string | 'Expired';
  handlerCreated: string;
  handlerModified: string;
  wnsId: string;
  wnfEventName: string;
  channelId: string;
  uri: string;
  wnsCreatedTime: string;
  wnsExpiryTime: string;
  activityId: Uint8Array;
};

type XMLPayload = ToastPayload | TilePayload | { badge: string };

type ToastPayload = {
  toast: {
    visual: Visual
  };
  audio: string;
}

type TilePayload = {
  tile: {
    visual: VisualArrayed
  };
}

type Visual = {
  binding: Binding;
};

type VisualArrayed = Visual & {
  binding: Binding[];
};

type Binding = {
  image?: string;
  text: (string | number)[];
}

/**
 * Retrieves a notification from the database.
 *
 * @param {Object} [like] - Optional parameters to filter the notification.
 * @param {string} [like.from] - The sender of the notification.
 * @param {string} [like.head] - The head of the notification.
 * @param {string} [like.body] - The body of the notification.
 * @param {number} [like.after=now] - UTC epoch after which the notification was created.
 * @returns {Promise<Notification>} A promise that resolves to the notification.
 */
export async function getNotification(like?: {
  from?: string | RegExp;
  head?: string | RegExp;
  body?: string | RegExp;
  after?: number;
}) {
  if (!like) {
    like = {
      after: new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000,
    };
  } else if (!like.after) {
    like.after = new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000;
  }

  const notificationsFile = path.join(process.env.HOME!, 'AppData', 'Local', 'Microsoft', 'Windows', 'Notifications', 'wpndatabase.db');
  const db = await sqlite.open({
    filename: notificationsFile,
    driver: sqlite3.Database
  });
  const parser = new XMLParser();

  let chosen: Notification & { from: string, head: string, body: string } | undefined = undefined;
  while (!chosen) {
    const notifications: Notification[] = await db.all(readFileSync(path.join(__dirname, 'noti.sql')).toString());
    for (const notification of notifications) {
      if (new Date(notification.arrivalTime).getTime() < like.after!) continue;
      if (!notification.payload) continue;
      const payload = Buffer.from(notification.payload).toString();
      const xml: ToastPayload = parser.parse(payload);
      if (!xml.toast) continue;
      const [head, body] = xml.toast.visual.binding.text.map(x => `${x}`);
      const from = notification.application;

      if (like.from) {
        if (typeof like.from === 'string' && like.from !== from) continue;
        if (like.from instanceof RegExp && !like.from.test(from)) continue;
      }
      if (like.head) {
        if (typeof like.head === 'string' && like.head !== head) continue;
        if (like.head instanceof RegExp && !like.head.test(head)) continue;
      }
      if (like.body) {
        if (typeof like.body === 'string' && like.body !== body) continue;
        if (like.body instanceof RegExp && !like.body.test(body)) continue;
      }
      chosen = {
        ...notification,
        from: from,
        head: head,
        body: body
      };
      break;
    }
    await setTimeout(300);
  }

  db.close();
  return chosen!;
}
