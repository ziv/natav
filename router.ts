import { Kind, Node } from "./node.ts";

export class Router {
  tree = new Node();

  add(method: string, path: string, handler: Function) {
    let i = 0;
    let l = path.length;
    let pnames: string[] = [];
    let j: number;

    for (; i < l; ++i) {
      let ch = path.charCodeAt(i);
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
    let current = this.tree;
    let max: number = 0;
    let prefix: string;
    let sl: number;
    let pl: number;
    let l: number;
    let n: Node;

    while (true) {
      prefix = current.prefix;
      sl = path.length;
      pl = prefix.length;
      l = 0;

      // LCP
      while (l < max && path.charCodeAt(l) === prefix.charCodeAt(l)) {
        l++;
      }
      if (l < pl) {
        // split node
        n = new Node(
          prefix.substring(l),
          current.children,
          current.kind,
          current.map,
        );
        // add to parent
        current.children = [n];

        // Reset parent node
        current.label = prefix.charCodeAt(0);
        current.prefix = prefix.substring(0, l);
        current.map = Object.create(null);
        current.kind = Kind.Static;

        if (l === sl) {
          // At parent node
          // @ts-ignore
          current.addHandler(method, handler, pnames);
          current.kind = kind;
        } else {
          // Create child node
          n = new Node(path.substring(l), [], kind);
          // @ts-ignore todo
          n.addHandler(method, handler, pnames);
          current.addChild(n);
        }
      } else if (l < sl) {
        path = path.substring(l);
        const c = current.findChildWithLabel(path.charCodeAt(0));
        if (c !== undefined) {
          // Go deeper
          current = c;
          continue;
        }
        // Create child node
        n = new Node(path, [], kind);
        // @ts-ignore
        n.addHandler(method, handler, pnames);
        current.addChild(n);
      } else if (handler !== undefined) {
        current.addHandler(method, handler, pnames);
      }
      return;
    }
  }

  find(
    method: string,
    path: string,
    cn?: Node,
    n = 0,
    result = [undefined, []],
  ) {
    cn = cn || this.tree;
    const sl = path.length;
    const prefix = cn.prefix;
    const pvalues: any = result[1]; // Params
    let i, pl, l, max, c;
    let preSearch; // Pre search

    // Search order static > param > match-any
    if (sl === 0 || path === prefix) {
      // Found
      const r = cn.findHandler(method);
      if ((result[0] = r && r.handler) !== undefined) {
        const pnames = r.pnames;
        if (pnames !== undefined) {
          for (i = 0, l = pnames.length; i < l; ++i) {
            pvalues[i] = {
              name: pnames[i],
              value: pvalues[i],
            };
          }
        }
      }
      return result;
    }

    pl = prefix.length;
    l = 0;

    // LCP
    // max = Math.min(sl, pl);
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
      path = ""; // End search
      this.find(method, path, c, n, result);
    }
    return result;
  }
}
