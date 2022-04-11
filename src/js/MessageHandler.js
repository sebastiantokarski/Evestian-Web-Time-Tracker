import { HTML_ID_PREFIX } from 'js/config';
import { debugLog } from 'js/utils';

class MessageHandler {
  #htmlHandler = null;

  #handlerObserver = null;

  static sendMessage(messageValue, callback) {
    chrome.runtime.sendMessage(messageValue, callback);
  }

  addHTMLElement() {
    this.#htmlHandler = document.createElement('div');
    this.#htmlHandler.id = `${HTML_ID_PREFIX}message-handler`;

    document.body.appendChild(this.#htmlHandler);
  }

  addObserver() {
    this.#handlerObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const messageName = mutation.attributeName;
        const messageValue = JSON.parse(mutation.target.getAttribute(messageName));

        debugLog('Handler observer:', messageName, messageValue);

        this.constructor.sendMessage(messageValue, (response) => {
          debugLog('Handler observer response:', response);
        });
      });
    });

    if (this.#htmlHandler) {
      this.#handlerObserver.observe(this.#htmlHandler, { attributes: true });
    }
  }

  init() {
    this.addHTMLElement();
    this.addObserver();
  }
}

export default new MessageHandler();
