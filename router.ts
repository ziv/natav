import {Handler, Kind, Node} from "./node.ts";

export class Router {
  tree = new Node();

  add(method: string, path: string, handler: Function) {
    let i = 0;
    let l = path.length;
    let pnames: string[] = [];
    let ch: Kind;
    let j: number;

    for (; i < l; ++i) {
      ch = path.charCodeAt(i);
      if (ch === Kind.Colon) {
        j = i + 1;

        this.insert(method, path.substring(0, i), Kind.Static);
        while (i < l && path.charCodeAt(i) !== Kind.Slash) {
          i++;
        }

        pnames.push(path.substring(j, i));
        path = path.substring(0, j) + path.substring(i);
        i = j;
        l = path.length;

        if (i === l) {
          this.insert(
            method,
            path.substring(0, i),
            Kind.Parameter,
            pnames,
            handler,
          );
          return;
        }
        this.insert(method, path.substring(0, i), Kind.Parameter, pnames);
      } else if (ch === Kind.Star) {
        this.insert(method, path.substring(0, i), Kind.Static);
        pnames.push("*");
        this.insert(method, path.substring(0, l), Kind.Any, pnames, handler);
        return;
      }
    }
    this.insert(method, path, Kind.Static, pnames, handler);
  }

  insert(
    method: string,
    path: string,
    kind: Kind,
    pnames?: any,
    handler?: Function,
  ) {
    let cn = this.tree;
    let prefix: string;
    let sl: number;
    let pl: number;
    let l: number;
    let max: number;
    let n: Node;
    let c: any;

    while (true) {
      prefix = cn.prefix;
      sl = path.length;
      pl = prefix.length;
      l = 0;

      // LCP
      max = sl < pl ? sl : pl;
      while (l < max && path.charCodeAt(l) === prefix.charCodeAt(l)) {
        l++;
      }

      if (l < pl) {
        // split node
        n = new Node(
          prefix.substring(l),
          cn.children,
          cn.kind,
          cn.map,
        );
        cn.children = [n]; // add to parent

        // Reset parent node
        cn.label = prefix.charCodeAt(0)
        cn.prefix = prefix.substring(0, l)
        cn.map = new Map<string, Handler>();
        cn.kind = Kind.Static;

        if (l === sl) {
          // At parent node
          cn.addHandler(method, handler as Function, pnames);
          cn.kind = kind;
        } else {
          // Create child node
          n = new Node(path.substring(l), [], kind);
          n.addHandler(method, handler as Function, pnames);
          cn.addChild(n);
        }
      } else if (l < sl) {
        path = path.substring(l);
        c = cn.findChildWithLabel(path.charCodeAt(0));
        if (c !== undefined) {
          // Go deeper
          cn = c;
          continue;
        }
        // Create child node
        n = new Node(path, [], kind);
        n.addHandler(method, handler as Function, pnames);
        cn.addChild(n);
      } else if (handler !== undefined) {
        cn.addHandler(method, handler, pnames);
      }
      return;
    }
  }

  find(
    method: string,
    path: string,
    cn?: Node,
    n = 0,
    result: [any, any[]] = [undefined, []],
  ) {
    cn = cn || this.tree // Current node as root
    const sl = path.length
    const prefix = cn.prefix
    const pvalues = result[1] // Params
    let i, pl, l, max, c;
    let preSearch // Pre search


    // Search order static > param > match-any
    if (sl === 0 || path === prefix) {
      // Found
      const r = cn.findHandler(method) as Handler;
      if ((result[0] = r && r.handler) !== undefined) {
        const pnames = r.pnames
        if (pnames !== undefined) {
          for (i = 0, l = pnames.length; i < l; ++i) {
            pvalues[i] = {
              name: pnames[i],
              value: pvalues[i]
            }
          }
        }
      }
      return result
    }

    pl = prefix.length;
    l = 0;

    // LCP
    max = sl < pl ? sl : pl;
    while (l < max && path.charCodeAt(l) === prefix.charCodeAt(l)) {
      l++;
    }

    if (l === pl) {
      path = path.substring(l);
    }
    preSearch = path;

    // Static node
    c = cn.findChild(path.charCodeAt(0), Kind.Static);
    if (c !== undefined) {
      this.find(method, path, c, n, result);
      if (result[0] !== undefined) {
        return result;
      }
      path = preSearch;
    }

    // Not found node
    if (l !== pl) {
      return result;
    }

    // Param node
    c = cn.findChildByKind(Kind.Parameter);
    if (c !== undefined) {
      l = path.length;
      i = 0;
      while (i < l && path.charCodeAt(i) !== Kind.Slash) {
        i++;
      }

      pvalues[n] = path.substring(0, i);

      n++;
      preSearch = path;
      path = path.substring(i);

      this.find(method, path, c, n, result);
      if (result[0] !== undefined) {
        return result;
      }

      n--;
      pvalues.pop();
      path = preSearch;
    }

    // Any node
    c = cn.findChildByKind(Kind.Any);
    if (c !== undefined) {
      pvalues[n] = path;
      path = ''; // End search
      this.find(method, path, c, n, result);
    }

    return result;
  }
}
