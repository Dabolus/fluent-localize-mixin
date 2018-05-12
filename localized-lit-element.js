import { LitElement } from '@polymer/lit-element';
import { MessageContext, ftl } from 'fluent';

/**
 * A LitElement extension that provides easy l10n out of the box.
 * @class
 * @extends LitElement
 */
export class LocalizedLitElement extends LitElement {
  /**
   * The LocalizedLitElement constructor.
   * Besides calling the super constructor, it also
   * instantiates the l10n cache.
   * @constructor
   */
  constructor() {
    super();
    if (!LocalizedLitElement.__localizationCache) {
      LocalizedLitElement.__localizationCache = {};
    }
  }

  /**
   * Loads the FTL resource at the given path for the given locale.
   * @param {String} path The path to fetch the FTL resource from
   * @param {String} locale The locale to associate the fetched resource with
   * @return {Promise<MessageContext>} A promise that resolves to the MessageContext
   *         with the fetched messages already added. This promise is mainly used internally,
   *         but you can also use it yourself to programmatically add other messages to the context
   */
  loadResourceForLocale(path, locale) {
    const cache = LocalizedLitElement.__localizationCache;
    if (!cache[locale]) {
      cache[locale] = {};
    }
    if (!cache[locale][path]) {
      cache[locale][path] = fetch(path)
        .then((res) => res.text())
        .then((localeFile) => ftl([localeFile]))
        .then((fluentTemplate) => {
          const ctx = new MessageContext(locale);
          ctx.addMessages(fluentTemplate);
          return ctx;
        });
    }
    this.__contextPromise = cache[locale][path];
    return this.__contextPromise;
  }

  /**
   * Localizes a string based on the current language context.
   * @param {string} key The key to get the localization of.
   * @param {*} params The params to pass to the localization string.
   * @return {Promise<string | undefined>} A promise that resolves to the localized string
   *         at the given key and with the given params (if it exists)
   */
  localize(key, params) {
    if (!this.__contextPromise) {
      return Promise.resolve();
    }
    return this.__contextPromise.then((ctx) => {
      const message = ctx.getMessage(key);
      if (!message) {
        return;
      }
      return ctx.format(message, params);
    });
  }
}
