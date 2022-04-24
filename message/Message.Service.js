'use strict';
const Message = require('./Message');

class MessageService {
  /**
   * @param { Message } model
   */
  constructor(model) {
    this.model = model;
  }

  static async createService() {
    try {
      const model = await Message.createModel();
      return new MessageService(model);
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Message.Service createService';
        console.log(error);
      }
      throw error;
    }
  }
  /**
   * @param {string} roomId
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
      return messages;
    } catch (error) {
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Message.Service getMessagesInRoom';
        console.log(error);
      }
      throw error;
    }
  }

  /** Додає повідомлення до БД
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
      if (!error.type) {
        error.type = 'server error';
      }
      if (!error.source) {
        error.source = 'Message.Service addMessage';
        console.log(error);
      }
      throw error;
    }
  }

  release() {
    this.model.release();
  }
}

module.exports = MessageService;
