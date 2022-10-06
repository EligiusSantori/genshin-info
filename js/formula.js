var formula, permute;
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
		//permutations(a, b) { return this.function('permutations', a, b); },
		permutations(a, b) { return this.divide(this.factorial(a), this.factorial(this.subtract(a, b))); },
		evaluate(expr) {
			return expr.cloneDeep().transform(function(node) {
				if(node.isConstantNode && node.value % 1 !== 0)
					node.value = math.fraction(node.value);
				return node;
			}).evaluate();
		},
		render(expr) {
			return expr.toString();
		},
	}
})();
