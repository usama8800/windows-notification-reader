-- https://github.com/kacos2000/Win10/blob/master/Notifications/readme.md
SELECT notification.id AS 'id',
  notification."Order" AS 'order',
  notification.handlerId AS 'handlerId',
  notificationHandler.primaryId AS 'application',
  CASE
    WHEN notificationHandler.parentId THEN notificationHandler.parentId
    ELSE ''
  END AS 'parent',
  notificationHandler.handlerType AS 'handlerType',
  notification.type AS 'type',
  notification.payload AS 'payload',
  notification.payloadType AS 'payloadType',
  notification.tag AS 'tag',
  notification."Group" AS 'group',
  Datetime(
    (notification.arrivalTime - 116444736000000000) / 10000000,
    'unixepoch'
  ) AS 'arrivalTime',
  CASE
    WHEN notification.expirytime = 0 THEN 'Expired'
    ELSE Datetime(
      (notification.expirytime - 116444736000000000) / 10000000,
      'unixepoch'
    )
  END AS 'expiryTime',
  notificationHandler.createdTime AS 'handlerCreated',
  notificationHandler.modifiedTime AS 'handlerModified',
  CASE
    WHEN notificationHandler.wnsId notnull THEN notificationHandler.wnsId
    ELSE ''
  END AS 'wnsId',
  CASE
    WHEN notificationHandler.wnfEventName notnull THEN notificationHandler.wnfEventName
    ELSE ''
  END AS 'wnfEventName',
  CASE
    WHEN wnsPushChannel.channelId notnull THEN wnsPushChannel.channelId
    ELSE ''
  END AS 'channelId',
  CASE
    WHEN wnsPushChannel.uri notnull THEN wnsPushChannel.uri
    ELSE ''
  END AS 'uri',
  CASE
    WHEN wnsPushChannel.createdTime notnull THEN Datetime(
      (wnsPushChannel.createdTime - 116444736000000000) / 10000000,
      'unixepoch'
    )
    ELSE ''
  END AS 'wnsCreatedTime',
  CASE
    WHEN wnsPushChannel.expiryTime notnull THEN Datetime(
      (wnsPushChannel.expiryTime - 116444736000000000) / 10000000,
      'unixepoch'
    )
    ELSE ''
  END AS 'wnsExpiryTime',
  CASE
    WHEN hex(notification.activityId) = '00000000000000000000000000000000' THEN ''
    ELSE hex(notification.activityId)
  END AS 'activityId'
FROM notification
  JOIN notificationHandler ON notificationHandler.recordId = notification.handlerId
  LEFT JOIN wnsPushChannel ON wnsPushChannel.handlerId = notificationHandler.recordId
ORDER BY arrivalTime DESC
