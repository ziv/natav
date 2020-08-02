const HTTP_METHODS = [
  "ACL",
  "BIND",
  "CHECKOUT",
  "CONNECT",
  "COPY",
  "DELETE",
  "GET",
  "HEAD",
  "LINK",
  "LOCK",
  "M-SEARCH",
  "MERGE",
  "MKACTIVITY",
  "MKCALENDAR",
  "MKCOL",
  "MOVE",
  "NOTIFY",
  "OPTIONS",
  "PATCH",
  "POST",
  "PROPFIND",
  "PROPPATCH",
  "PURGE",
  "PUT",
  "REBIND",
  "REPORT",
  "SEARCH",
  "SOURCE",
  "SUBSCRIBE",
  "TRACE",
  "UNBIND",
  "UNLINK",
  "UNLOCK",
  "UNSUBSCRIBE",
];

export enum Types {
  Static,
  Param,
  MatchAll,
  Regex,
  MultiParam,
}

export interface NodeOptions {
  prefix?: string;
  children?: any;
  kind?: Types;
  regex?: RegExp | null;
  handlers?: any;
}

// todo types!!!
export class Handler {
  constructor(
    public readonly handler: any,
    public readonly params: any[],
    public readonly store: any,
    public readonly paramsLength: number,
  ) {
  }
}

export class OldNode {
  prefix = "/";
  kind: Types = Types.Static;
  regex: RegExp | null = null;
  parametricBrother: OldNode | null = null;
  wildcardChild = null;
  children = new Map<string, OldNode>();
  handlers = new Map<string, Handler>();

  constructor(opts: NodeOptions = {}) {
    if (opts.prefix) {
      this.prefix = opts.prefix;
    }
    if (opts.children) {
      this.children = opts.children;
    }
    if (opts.kind) {
      this.kind = opts.kind;
    }
    // this.handlers = new Handlers(opts.handlers);
    if (opts.regex) {
      this.regex = opts.regex;
    }
  }

  get label(): string {
    return this.prefix[0];
  }

  get numberOfChildren(): number {
    return this.children.size;
  }

  addChild(node: OldNode): OldNode {
    let label;
    switch (node.kind) {
      case Types.Static:
        label = node.label;
        break;
      case Types.Param:
      case Types.Regex:
      case Types.MultiParam:
        label = ":";
        break;
      case Types.MatchAll:
        label = "*";
        break;
      default:
        throw new Error(`Unknown node kind: ${node.kind}`);
    }
    if (this.children.has(label)) {
      throw new Error(`There is already a child with label '${label}'`);
    }
    this.children.set(label, node);
    const labels = this.children.keys();
    let parametricBrother = this.parametricBrother;

    for (const child of this.children.values()) {
      if (":" === child.label) {
        parametricBrother = child;
        break;
      }
    }

    const iterate = (node: OldNode) => {
      if (!node) {
        return;
      }
      if (node.kind !== Types.Static) {
        return;
      }
      if (node !== this) {
        node.parametricBrother = parametricBrother || node.parametricBrother;
      }
      for (const c of node.children.values()) {
        iterate(c);
      }
    };

    iterate(this);
    return this;
  }

  reset(prefix: string): OldNode {
    this.prefix = prefix;
    this.children = new Map<string, OldNode>();
    this.kind = Types.Static;
    this.handlers = new Map<string, Handler>();
    this.regex = null;
    this.wildcardChild = null;
    return this;
  }

  findByLabel(path: string): OldNode | undefined {
    return this.children.get(path[0]);
  }

  findChild(path: string, method: string): OldNode | null {
    let child = this.findByLabel(path);
    // todo handlers
    if (child && (child.numberOfChildren > 0 && child.handlers.has(method))) {
      if (path.slice(0, child.prefix.length) === child.prefix) {
        return child;
      }
    }
    child = this.findByLabel(":");
    if (child && (child.numberOfChildren > 0 && child.handlers.has(method))) {
      return child;
    }
    child = this.findByLabel("*");
    if (child && (child.numberOfChildren > 0 && child.handlers.has(method))) {
      return child;
    }
    return null;
  }

  setHandler(method: string, handler: Function, params: any[], store: any) {
    if (this.handlers.has(method)) {
      throw new Error(`There is already an handler with method '${method}'`);
    }
    this.handlers.set(
      method,
      new Handler(handler, params, store, params.length),
    );
  }

  getHandler(method: string) {
    return this.handlers.get(method);
  }

  prettyPrint(prefix: string, tail: string) {
    // todo
    return "";
  }
}
