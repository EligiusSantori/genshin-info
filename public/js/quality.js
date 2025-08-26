const _default = { cd: null, cr: null, atk: null, def: null, hp: null, er: null, em: null };
const avg = { cd: 6.6, cr: 3.3, atk: 4.95, def: 6.2, hp: 4.95, er: 5.5, em: 19.5 };

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
			formula: formula,

			mode: { cv: '2', bd: '3/4', er: '1/3', em: '1/3' },
			quality: NaN,
			artifact: _.clone(_default),
			expression: null,
		},
		// computed: {
		// 	test: function() {
		// 		return 0;
		// 	},
		// },
		clear: function() {
			this.set('artifact', _.clone(_default));
		},
		format: function(n, decimals = 2) {
			if(n == undefined) return '';
			const e = 10 ** decimals;
			return Math.round(n * e) / e;
		},
		calculate: function() {
			let mode = this.get('mode') || '', a = this.get('artifact');
			let c = { cd: 1, cr: 1, bd: 1, er: 1, em: 1 };
			let scale = (what, from, to) => what != 0 && from != to ? formula.multiply(formula.divide(what, from), to) : what;
			let coeff = (value, multiply) => multiply != 1 && value != 0 ? formula.multiply(value, multiply) : value;
			c.cr = { '2': 2, '7/4': formula.fraction(7, 4), '3/2': formula.fraction(3, 2), '1': 1 }[mode.cv];
			c.bd = { '3/4': formula.fraction(3, 4), '2/3': formula.fraction(2, 3) }[mode.bd];
			c.er = { 'bd': c.bd, '1/3': formula.fraction(1, 3) }[mode.er];
			c.em = { '1': 1, 'bd': c.bd, '1/3': formula.fraction(1, 3) }[mode.em];

			this.set('expression', _.some(a, _.isFinite) ? formula.add(
				coeff(a.cd || 0, c.cd),
				coeff(a.cr || 0, c.cr),
				coeff(formula.parenthesis(formula.add(
					a.atk || 0,
					scale(a.def || 0, avg.def, avg.atk),
					scale(a.hp || 0, avg.hp, avg.atk),
				)), c.bd),
				coeff(a.er || 0, c.er),
				coeff(scale(a.em || 0, avg.em, avg.cd), c.em),
			) : null);
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
