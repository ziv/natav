const a = new Map();
a.set("aa", 1);
a.set("bb", 2);

for (const i of a) {
  console.log(i);
}

// function buildHandlers() {
//   let code = `handlers = handlers || {}
//   `;
//   for (let i = 0; i < 4; i++) {
//     let m = http.METHODS[i];
//     code += `this['${m}'] = handlers['${m}'] || null
//     `;
//   }
//   return new Function("handlers", code); // eslint-disable-line
// }
