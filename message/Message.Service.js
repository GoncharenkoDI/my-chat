'use strict';
const Message = require('./Message');

class MessageService {
  /**
   * @param { Message } model
   */
  constructor(model) {
    this.model = model;
  }

  static async createMessageService() {
    const model = await Message.createMessage();
    return new MessageService(model);
  }
  /**
   * @param {number} roomId
   * @returns { Promise<[{
   *   id : number,
   *   destination: string,
   *   author: number,
   *   user_name: string,
   *   text: string,
   *   created_at:Date,
   *   modified_at:Date}]> } знайдені повідомлення або []
   */
  async getMessagesInRoom(roomId) {
    try {
      const messages = await this.model.getMessagesInRoom(roomId);
      if (Object.keys(messages).length === 0) return [];
      return messages;
    } catch (error) {
      console.dir(error);
      return [];
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
  async addMessage(message) {
    try {
      const newMessage = await this.model.addMessage(message);
      return newMessage;
    } catch (error) {
      console.dir(error);
      return [];
    }
  }

  release() {
    this.model.release();
  }
}

module.exports = MessageService;
