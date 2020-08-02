import {assert, assertEquals} from "https://deno.land/std/testing/asserts.ts";
import {Kind, Node} from './node.ts';

const tree = () =>  new Node("/root", [new Node("/child")]);

Deno.test('node should be created with defaults', () => {
    const node = new Node()
    assert(node instanceof Node);
    assertEquals(node.prefix, "/");
    assertEquals(node.children, []);
    assertEquals(node.kind, Kind.Static);
    assert(node.map instanceof Map);
    assertEquals(node.map.size, 0);
});

Deno.test('node should be created with constructor items', () => {
    const node = new Node("/test", [new Node("/q")], Kind.Any);
    assertEquals(node.prefix, "/test");
    assertEquals(node.children.length, 1);
    assertEquals(node.kind, Kind.Any);
    assert(node.map instanceof Map);
    assertEquals(node.map.size, 0);
});

Deno.test('addChild', () => {
    const child = new Node();
    const root = new Node();
    root.addChild(child);
    assertEquals(root.children[0], child);
});

Deno.test('findChild should return undefined for no match', () => {
    const root = tree();
    assertEquals(root.findChild(0, Kind.Any), undefined);
    // const SLASH = 47;
});
