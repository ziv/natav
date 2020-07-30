import setPrototypeOf = Reflect.setPrototypeOf;

type NullFunc = Function | null;

export interface RouterOptions {
  defaultRoute?: Function;
  onBadUrl?: Function;
  caseInsensitive?: boolean;
  ignoreTrailingSlash?: boolean;
  maxParamLength?: number;
  allowUnsafeRegex?: boolean;
}

export class Router {
  defaultRoute: NullFunc = null;
  onBadUrl: NullFunc = null;
  caseInsensitive = false;
  ignoreTrailingSlash = false;
  maxParamLength = 100;
  allowUnsafeRegex = false;
  tree = [];
  routes = [];

  constructor(opts: RouterOptions = {}) {
    if (opts.defaultRoute) {
      // assert function
      this.defaultRoute = opts.defaultRoute;
    }
    if (opts.onBadUrl) {
      // assert function
      this.onBadUrl = opts.onBadUrl;
    }
    if (opts.caseInsensitive) {
      this.caseInsensitive = !!opts.caseInsensitive;
    }
    if (opts.ignoreTrailingSlash) {
      this.ignoreTrailingSlash = !!opts.ignoreTrailingSlash;
    }
    if (opts.maxParamLength) {
      // assert number
      this.maxParamLength = opts.maxParamLength;
    }
    if (opts.allowUnsafeRegex) {
      this.allowUnsafeRegex = !!opts.allowUnsafeRegex;
    }
  }

  // constructor() {
  //     // function router(ctx: any, next: Function) {
  //     //     router.handle(ctx, next);
  //     // }
  //     // setPrototypeOf(router, this);
  // }
  //
  // param(name: string, fn: Function) {
  //
  // }
  //
  // handle(ctx: any, next: Function) {
  //
  // }
  //
  // process_params(layer: any, called: any, ctx: any, done: Function) {
  //
  // }
  //
  // use(handler: Function) {
  //
  // }
}
