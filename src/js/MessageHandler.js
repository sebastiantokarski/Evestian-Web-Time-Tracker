import config from './config';
import utils from './utils';

export default class MessageHandler {
  constructor() {
    this.init();
  }

  addHandlerHTMLElement() {
    this.handler = document.createElement('div');

    this.handler.id = `${config.ID_PREFIX}message-handler`;
    document.body.appendChild(this.handler);
  }

  addHandlerObserver() {
    this.handlerObserver = new MutationObserver((mutations) => {
      mutations.map((mutation) => {
        const messageName = mutation.attributeName;
        const messageValue = JSON.parse(mutation.target.getAttribute(messageName));

        utils.debugLog('Handler observer:', messageName, messageValue);

        chrome.runtime.sendMessage(messageValue, (response) => {
          utils.debugLog(response);
        });
      });
    });

    this.handlerObserver.observe(this.handler, { attributes: true });
  }

  init() {
    this.addHandlerHTMLElement();
    this.addHandlerObserver();
  }
}
