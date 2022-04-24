'use strict';
const MessageService = require('./Message.Service');

/**
 * @param { string } roomId
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
    messageService = await MessageService.createService();
    const messages = await messageService.getMessagesInRoom(roomId);
    return messages;
  } catch (error) {
    if (!error.type) {
      error.type = 'server error';
    }
    if (!error.source) {
      error.source = 'message index getMessagesInRoom';
      console.log(error);
    }
    throw error;
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
    messageService = await MessageService.createService();
    const messages = await messageService.addMessage(message);
    return messages;
  } catch (error) {
    if (!error.type) {
      error.type = 'server error';
    }
    if (!error.source) {
      error.source = 'message index addMessage';
      console.log(error);
    }
    throw error;
  } finally {
    if (messageService) {
      messageService.release();
    }
  }
}
module.exports = { getMessagesInRoom, addMessage };
