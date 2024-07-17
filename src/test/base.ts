import { expect } from 'chai';
import notifier from 'node-notifier';
import { getNotification } from "..";

function sendNotification(body: string, head?: string) {
  notifier.notify({
    title: head,
    message: body,
  });
}

describe('Base', function () {
  this.slow(4000);
  this.timeout(10000);

  it('Notification any', async function () {
    const promise = getNotification();
    const randomBody = Math.random().toString(36).substring(2, 15);
    const randomHead = Math.random().toString(36).substring(2, 15);
    setTimeout(() => sendNotification(randomBody, randomHead), 1000);
    const notification = await promise;
    expect(notification.head).to.equal(randomHead);
    expect(notification.body).to.equal(randomBody);
  });

  it('Notification from regex', async function () {
    const promise = getNotification({ from: /^Snore\.DesktopToasts/ });
    const randomBody = Math.random().toString(36).substring(2, 15);
    const randomHead = Math.random().toString(36).substring(2, 15);
    setTimeout(() => sendNotification(randomBody, randomHead), 1000);
    const notification = await promise;
    expect(notification.from.startsWith('Snore.DesktopToasts')).to.equal(true);
    expect(notification.head).to.equal(randomHead);
    expect(notification.body).to.equal(randomBody);
  });

  it('Notification head', async function () {
    const randomBody = Math.random().toString(36).substring(2, 15);
    const randomHead = Math.random().toString(36).substring(2, 15);
    const promise = getNotification({ head: randomHead });
    setTimeout(() => sendNotification(randomBody, randomHead), 1000);
    const notification = await promise;
    expect(notification.head).to.equal(randomHead);
    expect(notification.body).to.equal(randomBody);
  });

  it('Notification body regex', async function () {
    const randomBody = Math.random().toString(36).substring(2, 15);
    const randomHead = Math.random().toString(36).substring(2, 15);
    const regex = new RegExp('^..' + randomBody.slice(2) + '$', "i");
    const promise = getNotification({ body: regex });
    setTimeout(() => sendNotification(randomBody, randomHead), 1000);
    const notification = await promise;
    expect(notification.head).to.equal(randomHead);
    expect(notification.body).to.equal(randomBody);
  });
});
