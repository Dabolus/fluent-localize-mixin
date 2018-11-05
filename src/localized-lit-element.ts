import { LitElement } from '@polymer/lit-element';
import { FluentBundle, ftl } from 'fluent';

export { html } from '@polymer/lit-element';
export { ftl } from 'fluent';

/**
 * A LitElement extension that provides easy l10n out of the box.
 * @class
 * @extends LitElement
 */
export class LocalizedLitElement extends LitElement {
  private static __localizationCache: any;
  private static globalLocale: string;
  private locale: string;

  /**
   * Gets the global locale
   * @return {string} The current global locale
   */
  get globalLocale() {
    return LocalizedLitElement.globalLocale;
  }

  /**
   * Sets the global locale
   * @param {string} locale The locale to set as global
   */
  set globalLocale(locale) {
    LocalizedLitElement.globalLocale = locale;
    document.documentElement.lang = locale;
  }

  /**
   * The LocalizedLitElement constructor.
   * Besides calling the super constructor, it also
   * instantiates the global and local l10n cache.
   * @constructor
   */
  constructor() {
    super();
    // Global requests cache, shared between every element
    // that extends LocalizedLitElement
    if (!LocalizedLitElement.__localizationCache) {
      LocalizedLitElement.__localizationCache = {};
    }
    // Local bundles, shared only between instances of the same element
    if (!this.constructor.prototype.__bundles) {
      this.constructor.prototype.__bundles = {};
    }
  }

  /**
   * Gets the bundle for the given locale.
   * If the bundle for the locale does not exists, a new bundle
   * is created and associated with the locale.
   * If no locale is provided, the current locale will be used.
   * If no current locale is set, the global locale will be used.
   * If no locale is available at all, an error will be thrown.
   * @param {string} [locale] The locale to get the bundle of
   * @return {FluentBundle} The bundle of the given locale
   */
  public getLocaleBundle(locale?: string): FluentBundle {
    const loc = locale || this.locale || this.globalLocale;
    if (!loc) {
      throw new Error('No locale provided');
    }
    const bundles = this.constructor.prototype.__bundles;
    if (!bundles[loc]) {
      bundles[loc] = new FluentBundle(loc);
    }
    return bundles[loc];
  }

  /**
   * Adds the given fluent template resource to the given locale bundle
   * @param {string} fluentTemplate The fluent template resource to add to the
   *        locale bundle
   * @param {string} [locale] The locale to add the fluent template resource to
   * @return {FluentBundle} The locale bundle with the new fluent template
   *         resource added
   */
  public addResourceForLocale(fluentTemplate: string, locale?: string): FluentBundle {
    const bundle = this.getLocaleBundle(locale);
    bundle.addMessages(fluentTemplate);
    return bundle;
  }

  /**
   * Loads the FTL resource at the given path for the given locale.
   * @param {string} path The path to fetch the FTL resource from
   * @param {string} [locale] The locale to associate the fetched resource with
   * @return {Promise<FluentBundle>} A promise that resolves to the
   *         FluentBundle with the fetched messages already added
   */
  public loadResourceForLocale(path: string, locale?: string): Promise<FluentBundle> {
    const cache = LocalizedLitElement.__localizationCache;
    if (!cache[path]) {
      cache[path] = fetch(path)
        .then((res) => res.text())
        .then((localeFile) => ftl([localeFile]));
    }
    return cache[path].then((fluentTemplate: string) =>
      this.addResourceForLocale(fluentTemplate, locale));
  }

  /**
   * Localizes a string based on the current language bundle.
   * @param {string} key The key to get the localization of.
   * @param {*} [params] The params to pass to the localization string.
   * @param {string} [locale] The locale of the message. Use this param
   *        to override the current language
   * @return {string | undefined} The localized string corresponding to the
   *         given key and with the given params (if it exists)
   */
  public localize(key: string, params?: any, locale?: string) {
    const bundle = this.getLocaleBundle(locale);
    const message = bundle.getMessage(key);
    if (!message) {
      return;
    }
    return bundle.format(message, params);
  }
}
