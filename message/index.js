'use strict';
const MessageService = require('./Message.Service');

/**
 *
 * @param { number } userId
 * @returns { Promise<[{
 *   id : number,
 *   destination: string,
 *   author: number,
 *   user_name: string,
 *   text: string,
 *   created_at:Date,
 *   modified_at:Date}]> } знайдені повідомлення або []
 */
async function getMessagesInRoom(roomId) {
  let messageService;
  try {
    messageService = await MessageService.createMessageService();
    const messages = await messageService.getMessagesInRoom(roomId);
    return messages;
  } catch (error) {
    console.dir(error);
    return [];
  } finally {
    if (messageService) {
      messageService.release();
    }
  }
}
/** Додає повідомлення до БД
 *
 * @param { {author: number, destination: string, text: string} } message
 * @returns { Promise<{
 *     id : number,
 *     destination: string,
 *     author: number,
 *     text: string,
 *     created_at:Date,
 *     modified_at:Date} | {} > }
 */
async function addMessage(message) {
  let messageService;
  try {
    messageService = await MessageService.createMessageService();
    const messages = await messageService.addMessage(message);
    return messages;
  } catch (error) {
    console.dir(error);
    return {};
  } finally {
    if (messageService) {
      messageService.release();
    }
  }
}
module.exports = { getMessagesInRoom, addMessage };
