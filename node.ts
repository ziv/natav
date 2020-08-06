
export enum Kind {
  Static = 0,
  Parameter = 1,
  Any = 2,
  Star = 42,
  Slash = 47,
  Colon = 58,
}

export interface Handler {
    handler: Function;
    pnames: any[];
}

export class Node {
  label: number;
  constructor(
    public prefix = "/",
    public children: Node[] = [],
    public kind = Kind.Static,
    public map = new Map<string, Handler>(),
  ) {
    this.label = prefix.charCodeAt(0);
  }

  addChild(node: Node) {
    this.children.push(node);
  }

  findChild(label: number, kind: Kind) {
    for (const child of this.children) {
      if (label === child.label && kind === child.kind) {
        return child;
      }
    }
  }

  findChildWithLabel(label: number) {
    for (const child of this.children) {
      if (label === child.label) {
        return child;
      }
    }
  }

  findChildByKind(kind: Kind) {
    for (const child of this.children) {
      if (kind === child.kind) {
        return child;
      }
    }
  }

  addHandler(method: string, handler: Function, pnames: any) {
    this.map.set(method, { handler, pnames });
  }

  findHandler(method: string): Handler | undefined {
    return this.map.get(method);
  }
}
