const _default = { cd: null, cr: null, atk: null, def: null, hp: null, er: null, em: null };

const avg = {
	cd: 6.6,
	cr: 3.3,
	atk: 4.95,
	def: 6.2,
	hp: 4.95,
	er: 5.5,
	em: 19.5
};

function ready(target, template) {
	var ractive = new Ractive({
		target: target,
		template: template,
		data: {
			formula: formula,

			mode: '',
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
			let mode = this.get('mode') || '', a = this.get('artifact'), f = null;
			if(_.some(a, _.isFinite))
				a = _.mapValues(a, (v) => v||0);
			else
				mode = undefined;
			switch(mode) {
				case '':
					f = formula.add(a.cd, formula.multiply(2, a.cr), formula.multiply(3/4, formula.parenthesis(formula.add(
						a.atk,
						a.def > 0 ? formula.multiply(formula.divide(a.def, avg.def), avg.atk) : 0,
						a.hp > 0 ? a.hp : 0,
						a.er > 0 ? formula.divide(formula.multiply(formula.divide(a.er, avg.er), avg.atk), 2): 0,
						a.em > 0 ? formula.divide(formula.multiply(formula.divide(a.em, avg.em), avg.atk), 2): 0,
					))));
				break;
				case 'ER=BD':
					f = formula.add(a.cd, formula.multiply(2, a.cr), formula.multiply(3/4, formula.parenthesis(formula.add(
						a.atk,
						a.def > 0 ? formula.multiply(formula.divide(a.def, avg.def), avg.atk) : 0,
						a.hp > 0 ? a.hp : 0,
						a.er > 0 ? formula.multiply(formula.divide(a.er, avg.er), avg.atk): 0,
						a.em > 0 ? formula.divide(formula.multiply(formula.divide(a.em, avg.em), avg.atk), 2): 0,
					))));
				break;
				case 'EM=BD':
					f = formula.add(a.cd, formula.multiply(2, a.cr), formula.multiply(3/4, formula.parenthesis(formula.add(
						a.atk,
						a.def > 0 ? formula.multiply(formula.divide(a.def, avg.def), avg.atk) : 0,
						a.hp > 0 ? a.hp : 0,
						a.er > 0 ? formula.divide(formula.multiply(formula.divide(a.er, avg.er), avg.atk), 2): 0,
						a.em > 0 ? formula.multiply(formula.divide(a.em, avg.em), avg.atk): 0,
					))));
				break;
				case '2CR=BD':
					f = formula.add(a.cd, formula.multiply(3/4, formula.parenthesis(formula.add(
						formula.multiply(2, a.cr),
						a.atk,
						a.def > 0 ? formula.multiply(formula.divide(a.def, avg.def), avg.atk) : 0,
						a.hp > 0 ? a.hp : 0,
						a.er > 0 ? formula.divide(formula.multiply(formula.divide(a.er, avg.er), avg.atk), 2): 0,
						a.em > 0 ? formula.divide(formula.multiply(formula.divide(a.em, avg.em), avg.atk), 2): 0,
					))));
				break;
				case '1CR 0EM':
					f = formula.add(a.cd, a.cr, formula.multiply(3/4, formula.parenthesis(formula.add(
						a.atk,
						a.def > 0 ? formula.multiply(formula.divide(a.def, avg.def), avg.atk) : 0,
						a.hp > 0 ? a.hp : 0,
						a.er > 0 ? formula.divide(formula.multiply(formula.divide(a.er, avg.er), avg.atk), 2): 0,
						a.em > 0 ? formula.multiply(a.em, 0) : 0,
					))));
				break;
				case '0ER':
					f = formula.add(a.cd, formula.multiply(2, a.cr), formula.multiply(3/4, formula.parenthesis(formula.add(
						a.atk,
						a.def > 0 ? formula.multiply(formula.divide(a.def, avg.def), avg.atk) : 0,
						a.hp > 0 ? a.hp : 0,
						a.er > 0 ? formula.multiply(a.er, 0) : 0,
						a.em > 0 ? formula.divide(formula.multiply(formula.divide(a.em, avg.em), avg.atk), 2): 0,
					))));
				break;
			}
			this.set('expression', f);
		}
	});
	ractive.observe('mode artifact.*', _.debounce(function() { this.calculate() }, 10));
}
