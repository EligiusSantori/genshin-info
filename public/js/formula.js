class Formula {
	constructor(name) {
		this.name = name || null;
		this.data = [];
		this.finalized = false;
	}
	// copy() {
	// 	return
	// }

	add(value) {
		this.data.push('+', value);
		return this;
	}
	sub(value) {
		this.data.push('-', value);
		return this;
	}
	mul(value) {
		this.data.push('×', value);
		return this;
	}
	div(value) {
		this.data.push('/', value);
		return this;
	}
	pow(value) {
		this.data.push('^', value);
		return this;
	}
	floor() {
		let f = new Formula();
		f.data.push('floor', this);
		return f;
	}
	concat(value) {
		this.data.push(...value.data);
		return this;
	}

	evaluate() { // TODO operator precedence
		if(!this.data.length)
			return 0;

		function evaluated(value) {
			return value instanceof Formula ? value.evaluate() : value;
		}
		function unary(vr, a, fn) {
			a.pop();
			a.push(fn(evaluated(vr)));
			return a;
		}
		function binary(vr, a, fn) {
			vr = fn(evaluated(a[a.length - 2]), evaluated(vr));
			a.splice(a.length - 2, 2, vr);
			return a;
		}

		let temp = this.data.reduce(function(a, vr) {
			switch(a[a.length - 1]) {
				case 'floor': return unary(vr, a, Math.floor);
				case '^': return binary(vr, a, Math.pow);
				default: a.push(vr); return a;
			}
		}, []).reduce(function(a, vr) {
			switch(a[a.length - 1]) {
				case '×': return binary(vr, a, _.multiply);
				case '/': return binary(vr, a, _.divide);
				default: a.push(vr); return a;
			}
		}, []).reduce(function(a, vr) {
			switch(a[a.length - 1]) {
				case '+': return binary(vr, a, _.add);
				case '-': return binary(vr, a, _.subtract);
				default: a.push(vr); return a;
			}
		}, []);

		if(temp.length == 1)
			return evaluated(temp[0]);
		else
			throw 'Expression is not calculable.';
	}
	toText() { // TODO groups
		if(!this.data.length)
			return '';

		function plain(value) {
			return !(value instanceof Formula);
		}

		this.finalize();
		return this.data.map(function(t) {
			if(t instanceof Formula) {
				t.finalize();
				if(t.data.length < 3)
					return t.toText();
				else if(t.data.length == 3 && t.data[1] == '/' && plain(t.data[0]) && plain(t.data[2]))
					return t.data.join('');
				else if(t.data.length == 3 && t.data[1] == '^' && plain(t.data[2]))
					return t.toText();
				else
					return '(' + t.toText() + ')';
			} else if(typeof(t) == 'string' && t.match(/[+\-×\/]/))
				return ' ' + t + ' ';
			else
				return t;
		}).join('');
	}
	toHtml() {

	}
	finalize() {
		if(this.finalized)
			return;
		else
			this.finalized = true;

		switch(this.data[0]) {
			case '+': this.data.shift(); break;
			case '-':
				if(this.data[1] instanceof Formula)
					this.data.unshift(0);
				else {
					this.data.shift();
					this.data[0] = -this.data[0];
				}
			break;
			case 'floor': break;
			default: this.data.unshift(0);
		}
		if(this.data[0] == 1 && this.data[1] == '×')
			this.data.splice(0, 2);
	}
}

function formula(fn, ...args) {
	let f = new Formula(...args);
	fn && fn(f);
	return f;
}
