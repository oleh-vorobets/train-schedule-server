import 'express';

declare module 'express' {
  export interface Response {
    setCookie: (name: string, value: string, options?: CookieOptions) => void;
  }
}
