//cardDeck = {
//  suits: ["club", "spade", "heart", "diamond"],
//  court: ["J", "Q", "K", "A"],
//  [Symbol.iterator]: function* () {
//    for (let suit of this.suits) {
//      for (let i = 2; i <= 10; i++) {
//        if (suit === "diamond") {
//          return "ye kr lo tum";
//        }
//        yield suit + i;
//      }
//      for (let q of this.court) yield suit + q;
//    }
//  },
//};
//
//console.log([...cardDeck]);

function* todo() {
  yield "a";
  return "b";
}

console.log(todo().next());
console.log(todo().next());

const tonottodo = todo();
console.log(tonottodo.next());
console.log(tonottodo.next());
