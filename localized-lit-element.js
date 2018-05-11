import { LitElement } from '@polymer/lit-element';
import { MessageContext, ftl } from 'fluent';

/**
 * A LitElement extension that provides easy l10n out of the box.
 * @class
 * @extends LitElement
 */
export class LocalizedLitElement extends LitElement {
  constructor() {
    super();
    this.constructor.prototype.__localizationCache = {
      requests: {},
      contexts: {},
    };
  }

  set locale(locale) {
    if (locale === this.__locale) {
      return;
    }

    const cache = this.constructor.prototype.__localizationCache;
    if (!cache || !cache.contexts[locale]) {
      throw new Error(`Resources for "${locale}" were not loaded!`);
    } else {
      this.__locale = locale;
    }
  }

  get locale() {
    return this.__locale;
  }

  loadResourceForLocale(path, locale) {
    const cache = this.constructor.prototype.__localizationCache;
    if (!cache.contexts[locale]) {
      cache.contexts[locale] = new MessageContext(locale);
    }
    if (!cache.requests[path]) {
      cache.requests[path] = fetch(path)
        .then((res) => res.text())
        .then((localeFile) => ftl([localeFile]));
    }
    return cache.requests[path]
      .then((fluentTemplate) => cache.contexts[locale].addMessages(fluentTemplate));
  }

  localize(key, params) {
    const cache = this.constructor.prototype.__localizationCache;
    if (!cache || !this.__locale || !cache.contexts[this.__locale]) {
      return;
    }
    const ctx = cache.contexts[this.__locale];
    const message = ctx.getMessage(key);
    return ctx.format(message, params);
  }
}
