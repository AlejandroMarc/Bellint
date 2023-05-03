// type let Output: Value[]=[];
const memory = new Map();
class Program {
    body;
    constructor(body) {
        this.body = body;
    }
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
    statements;
    constructor(statements) {
        this.statements = statements;
    }
    interpret() {
        for (const statement of this.statements)
            statement.interpret(memory);
    }
}
class Assignment {
    value;
    expression;
    constructor(value, expression) {
        this.value = value;
        this.expression = expression;
    }
    interpret(m) {
        if (!m.has(this.value.name)) {
            throw new Error(`Unknown variable: ${this.value.name}`);
        }
        m.set(this.value.name, this.expression.interpret(m));
    }
}
class VariableDeclaration {
    id;
    expression;
    constructor(id, expression) {
        this.id = id;
        this.expression = expression;
    }
    interpret(m) {
        if (m.has(this.id.name)) {
            throw new Error(`Variable already declared: ${this.id.name}`);
        }
        m.set(this.id.name, this.expression.interpret(m));
    }
}
class FunctionDeclaration {
    id;
    params;
    expression;
    constructor(id, params, expression) {
        this.id = id;
        this.params = params;
        this.expression = expression;
    }
    interpret(m) {
        if (m.has(this.id.name)) {
            throw new Error(`Identifier already declared: ${this.id.name}`);
        }
        m.set(this.id.name, [this.params, this.expression]);
    }
}
class PrintStatement {
    argument;
    constructor(argument) {
        this.argument = argument;
    }
    interpret(m) {
        const value = this.argument.interpret(m);
        if (typeof value !== "number") {
            throw new Error(`Variable is not a number`);
        }
        else {
            console.log(value);
        }
    }
}
class WhileStatement {
    exp;
    b;
    constructor(exp, b) {
        this.exp = exp;
        this.b = b;
    }
    interpret(m) {
        while (this.exp.interpret(m)) {
            this.b.interpret();
        }
    }
}
class Numeral {
    value;
    constructor(value) {
        this.value = value;
    }
    interpret() {
        if (typeof this.value !== "number")
            throw new Error(`Variable is not a number: ${this.value}`);
        else {
            return this.value;
        }
    }
}
class Identifier {
    name;
    constructor(name) {
        this.name = name;
    }
    interpret(m) {
        const value = m.get(this.name);
        if (value === undefined) {
            throw new Error(`Unknown variable: ${this.name}`);
        }
        else {
            return value;
        }
    }
}
class BooleanLiteral {
    value;
    constructor(value) {
        this.value = value;
    }
    interpret() {
        return this.value;
    }
}
class BinaryExpression {
    operator;
    left;
    right;
    constructor(operator, left, right) {
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    interpret(m) {
        const left = this.left.interpret(m);
        const right = this.right.interpret(m);
        if (["+", "-", "/", "%", "**", "*"].includes(this.operator) &&
            typeof left === "number" &&
            typeof right === "number") {
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
        }
        else if (["<", "<=", ">", ">="].includes(this.operator) &&
            typeof left === "number" &&
            typeof right === "number") {
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
        }
        else if (["&&", "||"].includes(this.operator) &&
            typeof left === "boolean" &&
            typeof right === "boolean") {
            switch (this.operator) {
                case "&&":
                    return left && right;
                case "||":
                    return left || right;
                default:
                    throw new Error(`Unknown operator: ${this.operator}`);
            }
        }
        else {
            throw new Error(`Unknown operator: ${this.operator}`);
        }
    }
}
class UnaryExpression {
    operator;
    operand;
    constructor(operator, operand) {
        this.operator = operator;
        this.operand = operand;
    }
    interpret(m) {
        const op = this.operand.interpret(m);
        switch (this.operator) {
            case "-":
                if (typeof op !== "number") {
                    throw new Error("not a number");
                }
                else {
                    return -op;
                }
            case "!":
                if (typeof op !== "boolean") {
                    throw new Error("not a number");
                }
                else {
                    return !op;
                }
            default:
                throw new Error(`Unknown operator: ${this.operator}`);
        }
    }
}
class ConditionalExpression {
    exp;
    exp1;
    exp2;
    constructor(exp, exp1, exp2) {
        this.exp = exp;
        this.exp1 = exp1;
        this.exp2 = exp2;
    }
    interpret(m) {
        const exp = this.interpret(m);
        const exp1 = this.exp1.interpret(m);
        const exp2 = this.exp2.interpret(m);
        if (exp === true) {
            return exp1;
        }
        else {
            return exp2;
        }
    }
}
class Call {
    callee;
    args;
    constructor(callee, args) {
        this.callee = callee;
        this.args = args;
    }
    interpret(m) {
        const funt = m.get(this.callee.name);
        if (typeof funt !== "function") {
            throw new Error(`not a function: ${this.callee.name}`);
        }
        return funt(...this.args.map((arg) => arg.interpret(m)));
    }
}
class ArrayLiteral {
    array;
    constructor(array) {
        this.array = array;
    }
    interpret(m) {
        return this.array.map((e) => e.interpret(m));
    }
}
class SubExpression {
    array;
    sub;
    constructor(array, sub) {
        this.array = array;
        this.sub = sub;
    }
    interpret(m) {
        const arrayValue = this.array.map((e) => e.interpret(m));
        const subscript = this.sub.interpret(m);
        if (typeof subscript !== "number") {
            throw new Error("The subscript given must be a number");
        }
        else if (!Array.isArray(arrayValue)) {
            throw new Error("array");
        }
        else if (this.array.length <= subscript) {
            throw new Error(`subscript out of range: ${arrayValue.length} <= ${subscript}`);
        }
        else {
            return arrayValue[subscript];
        }
    }
}
// Build the rest of the classes and interfaces here: PrintStatement,
// BinaryExpression, UnaryExpression, ConditionalExpression, Numeral,
// Identifier, etc.
function interpret(program) {
    program.interpret();
}
const sample = new Program(new Block([
    new PrintStatement(new Numeral(5)),
    new PrintStatement(new UnaryExpression("-", new Numeral(5))),
    new PrintStatement(new BinaryExpression("*", new Numeral(3), new Numeral(7))),
]));
interpret(sample);
export {};
