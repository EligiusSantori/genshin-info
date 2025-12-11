var formula, permute, distribute4, jaroWinkler;
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

	distribute4 = function*(count, predicate = Array.of) {
		for(let a = 0; a <= count; a++)
			for(let b = 0; b <= count - a; b++)
				for(let c = 0; c <= count - a - b; c++)
					yield predicate(a, b, c, count - a - b - c);
	}

	jaroWinkler = function(s1, s2) {
	  s1 = s1.toLowerCase().trim();
	  s2 = s2.toLowerCase().trim();
	  if (s1 === s2) return 100;
	  if (!s1 || !s2) return 0;

	  const len1 = s1.length, len2 = s2.length;
	  if (len1 === 0 || len2 === 0) return 0;
	  if (Math.abs(len1 - len2) > Math.max(len1, len2) * 0.5) return 0;  // Early exit

	  const maxDist = Math.floor(Math.max(len1, len2) / 2) - 1;
	  let m1 = [], m2 = [], matches = 0;

	  // Find matches
	  for (let i = 0; i < len1; i++) {
	    const rangeStart = Math.max(0, i - maxDist);
	    const rangeEnd = Math.min(len2 - 1, i + maxDist);
	    for (let j = rangeStart; j <= rangeEnd; j++) {
	      if (m2[j] !== true && s1[i] === s2[j]) {
	        m1[i] = true;
	        m2[j] = true;
	        matches++;
	        break;
	      }
	    }
	  }

	  if (matches === 0) return 0;
	  let t = 0;
	  let p1 = 0, p2 = 0;
	  for (let i = 0; i < len1; i++) {
	    if (m1[i]) {
	      while (p2 < len2 && !m2[p2]) p2++;
	      if (s1[i] !== s2[p2]) t++;
	      p2++;
	    }
	  }
	  t /= 2;

	  let jaro = ((matches / len1) + (matches / len2) + ((matches - t) / matches)) / 3;
	  // Winkler prefix bonus
	  let prefix = 0;
	  for (let i = 0; i < Math.min(len1, len2, 4); i++) {
	    if (s1[i] === s2[i]) prefix++;
	    else break;
	  }
	  return jaro + (prefix * 0.1 * (1 - jaro));
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
		constant(c) { return c instanceof math.Node ? c : new math.ConstantNode(c); },
		parenthesis(node) { return new math.ParenthesisNode(node); },
		function(fn, ...nodes) { return new math.FunctionNode(fn, nodes.map(wrap)); },
		fraction(a, b) { return new math.ConstantNode(math.fraction(a, b)); },
		add(...args) { return args.reduce((a, v) => new math.OperatorNode('+', 'add', [wrap(a), wrap(v)]))},
		subtract(...args) { return args.reduce((a, v) => new math.OperatorNode('-', 'subtract', [wrap(a), wrap(v)]))},
		multiply(...args) { return args.reduce((a, v) => new math.OperatorNode('×', 'multiply', [wrap(a), wrap(v)]))},
		divide(...args) { return args.reduce((a, v) => new math.OperatorNode('/', 'divide', [wrap(a), wrap(v)]))},
		pow(a, b) { return new math.OperatorNode('^', 'pow', [wrap(a), wrap(b)]); },
		factorial(n) { return new math.OperatorNode('!', 'factorial', [wrap(n)]); },
		round(v, d) { return new math.FunctionNode('round', [wrap(v), this.constant(d)]); },
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
