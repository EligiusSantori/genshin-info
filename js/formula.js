var formula, permute, distribute4;
(function() {
	permute = function*(a) {
		let c = Array(a.length).fill(0), i = 1, k, p;

		yield a.slice();
		while(i < a.length) {
			if(c[i] < i) {
				k = i % 2 && c[i];
				p = a[i];
				a[i] = a[k];
				a[k] = p;
				++c[i];
				i = 1;
				yield a.slice();
			} else {
				c[i] = 0;
				++i;
			}
		}
	}

	distribute4 = function*(count) {
		for(let a = 0; a <= count; a++)
			for(let b = 0; b <= count - a; b++)
				for(let c = 0; c <= count - a - b; c++)
					yield [a, b, c, count - a - b - c];
	}

	function wrap(expr) {
		switch(math.typeOf(expr)) {
			case 'number':
				// if(expr % 1 !== 0)
					// expr = math.fraction(expr);
					// expr = math.round(expr, 4);
			case 'Fraction':
				return new math.ConstantNode(expr);
			default: return expr;
		}
	}

	// new ConditionalNode(condition: Node, trueExpr: Node, falseExpr: Node)?
	formula = {
		constant(c) { return new math.ConstantNode(c); },
		parenthesis(node) { return new math.ParenthesisNode(node); },
		function(fn, ...nodes) { return new math.FunctionNode(fn, nodes.map(wrap)); },
		fraction(a, b) { return new math.ConstantNode(math.fraction(a, b)); },
		add(...args) { return args.reduce((a, v) => new math.OperatorNode('+', 'add', [wrap(a), wrap(v)]))},
		subtract(...args) { return args.reduce((a, v) => new math.OperatorNode('-', 'subtract', [wrap(a), wrap(v)]))},
		multiply(...args) { return args.reduce((a, v) => new math.OperatorNode('×', 'multiply', [wrap(a), wrap(v)]))},
		divide(...args) { return args.reduce((a, v) => new math.OperatorNode('/', 'divide', [wrap(a), wrap(v)]))},
		pow(a, b) { return new math.OperatorNode('^', 'pow', [wrap(a), wrap(b)]); },
		factorial(n) { return new math.OperatorNode('!', 'factorial', [wrap(n)]); },
		round(v, d) { return new math.FunctionNode('round', wrap(v), d); },
		min(...args) { return new math.FunctionNode('min', args.map(wrap)); },
		max(...args) { return new math.FunctionNode('max', args.map(wrap)); },
		larger(a, b, e = false) {  return new math.OperatorNode(e ? '>=' : '>', e ? 'largerEq' : 'larger', [wrap(a), wrap(b)]) },
		smaller(a, b, e = false) { return new math.OperatorNode(e ? '<=' : '<', e ? 'smallerEq' : 'smaller', [wrap(a), wrap(b)])  },
		equal(a, b, i = false) { return new math.OperatorNode(i ? '!=' : '==', i ? 'unequal' : 'equal', [wrap(a), wrap(b)]) },
		largerEq(a, b) { return this.larger(a, b, true) },
		smallerEq(a, b) { return this.smaller(a, b, true) },
		unequal(a, b) { return this.equal(a, b, true) },
		//permutations(a, b) { return this.function('permutations', a, b); },
		permutations(a, b) { return this.divide(this.factorial(a), this.factorial(this.subtract(a, b))); },
		evaluate(expr, scope) { // Precision loss error fix.
			return expr.cloneDeep().transform(function(node) {
				if(node.isConstantNode && node.value % 1 !== 0)
					node.value = math.fraction(node.value);
				return node;
			}).evaluate(scope);
		},
		render(expr, simplify) {
			if (simplify)
				expr = math.simplify(expr);
			return expr.toString();
		},
	}
})();
