declare module 'fluent' {
  export class FluentBundle {
    constructor(locale: string);
    addMessages(ftl: string): void;
    getMessage(key: string): any;
    format(message: any, params?: any, errors?: any[]): string | undefined;
  }
  export function ftl(strings: TemplateStringsArray | string[]): string;
}
