import type { Options as EJSOptions } from 'ejs';
import type { Options as MinifyOptions } from 'html-minifier-terser';
import type { HtmlTagDescriptor } from 'vite';

export interface InjectOptions {
  /**
   * Data injected into HTML
   */
  data?: Record<string, any>;
  /**
   * List of tags to be injected
   */
  tags?: HtmlTagDescriptor[];
  /**
   * Ejs configuration options
   */
  ejsOptions?: EJSOptions;
}

export interface MpaPage {
  /**
   * HTML file name
   */
  filename: string;
  /**
   * Template path
   */
  template: string;
  /**
   * Entry file
   */
  entry?: string;
  /**
   * Data injected into HTML
   */
  inject?: InjectOptions;
}

export type SpaPage = Partial<Omit<MpaPage, 'filename'>>;

export interface UserOptions {
  page?: SpaPage | MpaPage[];
  /**
   * Minify options
   * @default true
   */
  minify?: MinifyOptions | boolean;
}
