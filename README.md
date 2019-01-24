# Fluent Localize Mixin

## A mixin for custom elements that provides easy l10n out of the box.

> _Note: this package was previously known as `localized-lit-element`_

Fluent Localize Mixin is a simple mixin that allows to easily localize your 
custom elements using
[Mozilla's Project Fluent syntax](https://projectfluent.org/). It allows you to 
load `.ftl` files and pass Fluent strings directly to your element.
The translations can then be used by calling the provided method `localize`.

## Getting started

If you have already created your element extending LitElement, adding l10n is
incredibly simple. For example, given this LitElement:

```html
<script src="node_modules/@webcomponents/webcomponents-bundle.js"></script>
<script type="module">
  import {LitElement, html} from 'lit-element';

  class MyElement extends LitElement {

    static get properties() { return { mood: { type: String }; }

    render({mood}) {
      return html`<h1>Web Components are ${mood}!</h1>`;
    }

  }

  customElements.define('my-element', MyElement);
</script>

<my-element mood="happy"></my-element>
```

The same element with l10n added would look like this:

```html
<script src="node_modules/@webcomponents/webcomponents-bundle.js"></script>
<script type="module">
  import {LitElement, html} from 'lit-element';
  import {localize} from 'fluent-localize-mixin';

  class MyElement extends localize(LitElement) {

    static get properties() { return { mood: { type: String }; }

    render({mood}) {
      return html`<h1>${this.localize('my-phrase', {mood})}</h1>`;
    }
  
    constructor() {
      super();

      // Set the component locale
      this.locale = 'en-US';
      // You can also set `this.globalLocale` to share the locale between your
      // elements

      // Add resources to the 'en-US' locale
      this.addResourceForLocale(ftl`
        my-phrase = Web Components are { $mood }!
      `, 'en-US');

      // You can also load resources from an .ftl file using the
      // `loadResourceForLocale` method
    }

  }

  customElements.define('my-element', MyElement);
</script>

<my-element mood="happy"></my-element>
```

**Done!**

## Available fields and methods

### Fields

#### `locale: string`

The `locale` field is used to set and get the default locale for the component.
Note that this value is per instance.
If a different locale is specified when calling one of the provided methods,
that value will take the precedence over this one.

#### `globalLocale: string`

The `globalLocale` field is used to set and get the default global locale.
This value is shared across all elements that extend from `LocalizedLitElement`.
You can this value to set the locale at once all over your application.
Note that if a locale is specified inside an element, or a provided method is
called passing a locale, those values will take the precedence over this one.

### Methods

#### `getLocaleContext([locale]: string): MessageContext`

Gets the
[MessageContext](http://projectfluent.org/fluent.js/fluent/MessageContext.html)
for the given locale.
If the context for the locale does not exists, a new context is created and
associated with the locale.
If no locale is provided, the current locale will be used.
If no current locale is set, the global locale will be used.
If no locale is available at all, an error will be thrown.

#### `addResourceForLocale(fluentTemplate: string, [locale]: string): MessageContext`

Adds the given fluent template resource to the given locale context.
Returns the locale context with the new resource added.

#### `loadResourceForLocale(path: string, [locale]: string): Promise<MessageContext>`

Loads the FTL resource at the given path for the given locale.
The resource at the given path will be fetched using the
[Fetch API](https://developer.mozilla.org/it/docs/Web/API/Fetch_API).
This method returns a promise that resolves after the path is fetched and its
values are added to the specified locale context. If fetching the specified
path fails, the promise is rejected.

#### `localize(key: string, [params]: any, [locale]: string): string | undefined`

Localizes a string based on the current language context.
The only mandatory field is the key. The params parameter can be used to pass
parameters to the Fluent message.
If the string at the given key does not exist, `undefined` will be returned.
You can call this method directly inside your `_render` method to localize
your element template.
