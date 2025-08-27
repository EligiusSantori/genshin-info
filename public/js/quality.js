const Artifact = { cd: null, cr: null, atk: null, def: null, hp: null, er: null, em: null };
const average = db.artifacts.minor.average;

formula.scale = function(what, from, to) { return what != 0 && from != to ? this.multiply(this.divide(what, from), to) : what; }
formula.coeff = function(value, multiply) { return multiply != 1 && value != 0 ? this.multiply(value, multiply) : value; }
formula.quality = function(a, c) {
	return this.add(
		this.coeff(a.cd || 0, c.cd),
		this.coeff(a.cr || 0, c.cr),
		this.coeff(this.parenthesis(this.add(
			a.atk || 0,
			this.scale(a.def || 0, average.def, average.atk),
			this.scale(a.hp || 0, average.hp, average.atk),
		)), c.bd),
		this.coeff(a.er || 0, c.er),
		this.coeff(this.scale(a.em || 0, average.em, average.cd), c.em),
	);
};

function ready(target, template) {
	Ractive.decorators.mathjax = function(node) {
		return {
			update: function(expr) {
				console.log(node);
				setTimeout(function(){
					//MathJax.typesetPromise?.([node]);
					MathJax.typesetPromise?.();
				} , 5);
			},
		  teardown: function() {
					MathJax.typesetClear();
		  }
		};
	};

	var ractive = new Ractive({
		target: target,
		template: template,
		data: {
			mode: { cv: '2', bd: '3/4', er: '1/3', em: '1/3' },
			artifact: _.clone(Artifact),
			expression: null,
		},
		computed: {
			factor: function() {
				let mode = this.get('mode');
				let bd = { '3/4': formula.fraction(3, 4), '2/3': formula.fraction(2, 3) }[mode.bd];
				return {
					cd: 1,
					cr: { '2': 2, '7/4': formula.fraction(7, 4), '3/2': formula.fraction(3, 2), '1': 1 }[mode.cv],
					bd: bd,
					er: { 'bd': bd, '1/3': formula.fraction(1, 3) }[mode.er],
					em: { '1': 1, 'bd': bd, '1/3': formula.fraction(1, 3) }[mode.em],
				};
			},
		},
		clear: function() {
			this.set('artifact', _.clone(Artifact));
		},
		format: function(n, decimals = 2) {
			if(n == undefined) return '';
			const e = 10 ** decimals;
			return Math.round(n * e) / e;
		},
		calculate: function() {
			let c = this.get('factor'), a = this.get('artifact');
			this.set('expression', _.some(a, _.isFinite) ? formula.quality(a, c) : null);
		},
	});
	ractive.observe('mode.* artifact.*', _.debounce(function() {
		// let display = this.find('#mathjax');
		// let mj = MathJax.startup.document.clearMathItemsWithin([display])[0];
		// if (mj) display.innerText = mj.math;
		// console.log(display, mj);

		//((e) => e ? MathJax.typesetClear([e]) : undefined)(this.find('#mathjax'));
		//MathJax.typesetClear();

		this.calculate()
	}, 10));
}
