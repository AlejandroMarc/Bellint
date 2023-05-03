import util from "util";
type Value =
  | number
  | boolean
  | Value[]
  | ((...args: Value[]) => Value)
  | [Identifier[], Expression];
type Memory = Map<string, Value>;
// type let Output: Value[]=[];
const memory = new Map();

class Program {
  constructor(public body: Block) {}
  interpret() {
    // this.body.interpret()
    // return output;
    const memory = new Map();
    memory.set("sin", Math.sin);
    memory.set("cos", Math.cos);
    memory.set("hypot", Math.hypot);
    memory.set("sqrt", Math.sqrt);
    memory.set("π", Math.PI);
    for (const statement of this.body.statements) {
      statement.interpret(memory);
    }
  }
}

class Block {
  constructor(public statements: Statement[]) {}
  interpret() {
    for (const statement of this.statements) statement.interpret(memory);
  }
}

interface Statement {
  interpret(m: Memory): void;
}

class Assignment implements Statement {
  constructor(public value: Identifier, public expression: Expression) {}
  interpret(m: Memory) {
    if (!m.has(this.value.name)) {
      throw new Error(`Unknown variable: ${this.value.name}`);
    }
    m.set(this.value.name, this.expression.interpret(m));
  }
}

class VariableDeclaration implements Statement {
  constructor(public id: Identifier, public expression: Expression) {}
  interpret(m: Memory) {
    if (m.has(this.id.name)) {
      throw new Error(`Variable already declared: ${this.id.name}`);
    }
    m.set(this.id.name, this.expression.interpret(m));
  }
}

class FunctionDeclaration implements Statement {
  constructor(
    public id: Identifier,
    public params: Identifier[],
    public expression: Expression
  ) {}
  interpret(m: Memory): void {
    if (m.has(this.id.name)) {
      throw new Error(`Identifier already declared: ${this.id.name}`);
    }
    m.set(this.id.name, [this.params, this.expression]);
  }
}

class PrintStatement implements Statement {
  constructor(public argument: Expression) {}
  interpret(m: Memory): void {
    const value = this.argument.interpret(m);
    if (typeof value !== "number") {
      throw new Error(`Variable is not a number`);
    } else {
      console.log(value);
    }
  }
}

class WhileStatement implements Statement {
  constructor(public exp: Expression, public b: Block) {}
  interpret(m: Memory): void {
    while (this.exp.interpret(m)) {
      this.b.interpret();
    }
  }
}

interface Expression {
  interpret(m: Memory): Value;
}

class Numeral implements Expression {
  constructor(public value: Value) {}
  interpret(): Value {
    if (typeof this.value !== "number")
      throw new Error(`Variable is not a number: ${this.value}`);
    else {
      return this.value;
    }
  }
}

class Identifier implements Expression {
  constructor(public name: string) {}
  interpret(m: Memory): Value {
    const value = m.get(this.name);
    if (value === undefined) {
      throw new Error(`Unknown variable: ${this.name}`);
    } else {
      return value;
    }
  }
}

class BooleanLiteral implements Expression {
  constructor(public value: boolean) {}
  interpret(): Value {
    return this.value;
  }
}

class BinaryExpression implements Expression {
  constructor(
    public operator: string,
    public left: Expression,
    public right: Expression
  ) {}
  interpret(m: Memory): Value {
    const left = this.left.interpret(m);
    const right = this.right.interpret(m);
    if (
      ["+", "-", "/", "%", "**", "*"].includes(this.operator) &&
      typeof left === "number" &&
      typeof right === "number"
    ) {
      switch (this.operator) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        case "*":
          return left * right;
        case "/":
          return left / right;
        case "%":
          return left % right;
        case "**":
          return left ** right;
        default:
          throw new Error(`Unknown operator: ${this.operator}`);
      }
    } else if (
      ["<", "<=", ">", ">="].includes(this.operator) &&
      typeof left === "number" &&
      typeof right === "number"
    ) {
      switch (this.operator) {
        case "<":
          return left < right;
        case "<=":
          return left <= right;
        case ">":
          return left > right;
        case ">=":
          return left >= right;
        default:
          throw new Error(`Unknown operator: ${this.operator}`);
      }
    } else if (
      ["&&", "||"].includes(this.operator) &&
      typeof left === "boolean" &&
      typeof right === "boolean"
    ) {
      switch (this.operator) {
        case "&&":
          return left && right;
        case "||":
          return left || right;
        default:
          throw new Error(`Unknown operator: ${this.operator}`);
      }
    } else {
      throw new Error(`Unknown operator: ${this.operator}`);
    }
  }
}

class UnaryExpression implements Expression {
  constructor(public operator: string, public operand: Expression) {}
  interpret(m: Memory): Value {
    const op = this.operand.interpret(m);
    switch (this.operator) {
      case "-":
        if (typeof op !== "number") {
          throw new Error("not a number");
        } else {
          return -op;
        }

      case "!":
        if (typeof op !== "boolean") {
          throw new Error("not a number");
        } else {
          return !op;
        }

      default:
        throw new Error(`Unknown operator: ${this.operator}`);
    }
  }
}

class ConditionalExpression implements Expression {
  constructor(
    public exp: Expression,
    public exp1: Expression,
    public exp2: Expression
  ) {}
  interpret(m: Memory): Value {
    const exp = this.interpret(m);
    const exp1 = this.exp1.interpret(m);
    const exp2 = this.exp2.interpret(m);
    if (exp === true) {
      return exp1;
    } else {
      return exp2;
    }
  }
}

class Call implements Expression {
  constructor(public callee: Identifier, public args: Expression[]) {}
  interpret(m: Memory): Value {
    const funt = m.get(this.callee.name);
    if (typeof funt !== "function") {
      throw new Error(`not a function: ${this.callee.name}`);
    }
    return funt(...this.args.map((arg) => arg.interpret(m)));
  }
}

class ArrayLiteral implements Expression {
  constructor(public array: Expression[]) {}
  interpret(m: Memory): Value {
    return this.array.map((e) => e.interpret(m));
  }
}

class SubExpression implements Expression {
  constructor(public array: Expression[], public sub: Expression) {}
  interpret(m: Memory): Value {
    const arrayValue = this.array.map((e) => e.interpret(m));
    const subscript = this.sub.interpret(m);
    if (typeof subscript !== "number") {
      throw new Error("The subscript given must be a number");
    } else if (!Array.isArray(arrayValue)) {
      throw new Error("array");
    } else if (this.array.length <= subscript) {
      throw new Error(
        `subscript out of range: ${arrayValue.length} <= ${subscript}`
      );
    } else {
      return arrayValue[subscript];
    }
  }
}

// Build the rest of the classes and interfaces here: PrintStatement,
// BinaryExpression, UnaryExpression, ConditionalExpression, Numeral,
// Identifier, etc.

function interpret(program: Program) {
  program.interpret();
}

const sample: Program = new Program(
  new Block([
    new PrintStatement(new Numeral(5)),
    new PrintStatement(new UnaryExpression("-", new Numeral(5))),
    new PrintStatement(
      new BinaryExpression("*", new Numeral(3), new Numeral(7))
    ),
  ])
);

interpret(sample);
