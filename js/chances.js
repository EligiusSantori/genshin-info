const _default = {
	origin: 'domain',
	strict: true,
	loss: 0,
	format: 'auto',
	multiplier: {
		type: 'resin',
		resin: 40,
		days: 0,
		months: 0,
		years: 0,
	},
	artifacts: 3,
	slot: 0,
	stat: 'hp',
	bonus: []
};

const weights = {
	stat: {
		'2': { 'hp%': 0.2668, 'atk%': 0.2666, 'def%': 0.2666, 'er': 0.1, 'em': 0.1 },
		'3': { 'hp%': 0.19175, 'atk%': 0.19175, 'def%': 0.1915, 'ed': 0.05, 'em': 0.025 },
		'4': { 'hp%': 0.22, 'atk%': 0.22, 'def%': 0.22, 'cr': 0.1, 'cd': 0.1, 'hb': 0.1, 'em': 0.04 },
	},
	bonus: {
		'0': {'hp': 0, 'atk': 0.1579, 'def': 0.1579, 'hp%': 0.1053, 'atk%': 0.1053, 'def%': 0.1053, 'er': 0.1053, 'em': 0.1053, 'cr': 0.0789, 'cd': 0.0789},
		'1': {'hp': 0.1579, 'atk': 0, 'def': 0.1579, 'hp%': 0.1053, 'atk%': 0.1053, 'def%': 0.1053, 'er': 0.1053, 'em': 0.1053, 'cr': 0.0789, 'cd': 0.0789},
		'2': {'hp': 0.15, 'atk': 0.15, 'def': 0.15, 'hp%': 0.1, 'atk%': 0.1, 'def%': 0.1, 'er': 0.1, 'em': 0.1, 'cr': 0.075, 'cd': 0.075},
		'3': {
			'ed': {'hp': 0.1364, 'atk': 0.1364, 'def': 0.1364, 'hp%': 0.0909, 'atk%': 0.0909, 'def%': 0.0909, 'er': 0.0909, 'em': 0.0909, 'cr': 0.0682, 'cd': 0.0682},
			'*': {'hp': 0.15, 'atk': 0.15, 'def': 0.15, 'hp%': 0.1, 'atk%': 0.1, 'def%': 0.1, 'er': 0.1, 'em': 0.1, 'cr': 0.075, 'cd': 0.075},
		},
		'4': {
			'cr_cd': {'hp': 0.1463, 'atk': 0.1463, 'def': 0.1463, 'hp%': 0.0976, 'atk%': 0.0976, 'def%': 0.0976, 'er': 0.0976, 'em': 0.0976, 'cr': 0.0732, 'cd': 0.0732},
			'hb': {'hp': 0.1364, 'atk': 0.1364, 'def': 0.1364, 'hp%': 0.0909, 'atk%': 0.0909, 'def%': 0.0909, 'er': 0.0909, 'em': 0.0909, 'cr': 0.0682, 'cd': 0.0682},
			'*': {'hp': 0.15, 'atk': 0.15, 'def': 0.15, 'hp%': 0.1, 'atk%': 0.1, 'def%': 0.1, 'er': 0.1, 'em': 0.1, 'cr': 0.075, 'cd': 0.075},
		},
	},
};

function createArtifacts(target, template, storage) {
	let ractive = new Ractive({
		target: target,
		template: template,
		data: Object.assign(JSON.parse(localStorage.getItem(storage)) || _default, {
			cloneDeep: _.cloneDeep,
			hasBonus(stat) {
				return this.get('bonus').indexOf(stat) >= 0;
			},
			mayBonus(stat) {
				const bonus = this.get('bonus');
				return bonus.length >= 4 && bonus.indexOf(stat) < 0;
			},
		}),
		computed: {
			obtain4() {
				return this.obtain(4);
			},
			obtain3() {
				return this.obtain(3);
			},
			obtainAll() {
				const obtain4 = this.get('obtain4');
				const obtain3 = this.get('obtain3');
				return formula().add(formula().add(obtain4).add(obtain3));
			},
			summary() {
				const obtain4 = _.cloneDeep(this.get('obtain4'));
				const obtain3 = _.cloneDeep(this.get('obtain3'));
				const enchant4 = this.get('enchant4');
				const enchant3 = this.get('enchant3');
				const scale = this.get('scale');
				return formula().add(obtain4.mul(enchant4).concat(obtain3.mul(enchant3))).mul(scale);
			},
			enchant4() {
				return this.enchant(4);
			},
			enchant3() {
				return this.enchant(3);
			},
			dropChance() {
				const resin = this.get('multiplier.resin');
				switch(this.get('origin')) {
					case 'domain': return formula().add(resin).div(20).mul(1.065);
				}
			},
			tries() {
				const artifacts = this.get('artifacts');
				return formula().add(formula().add(artifacts).sub(1)).div(2).floor();
				return artifacts ? formula(f => f.floor(formula(f => f.add(formula(f => f.add(artifacts).sub(1))).div(2)))) : formula(f => f.add(0));
			},
			scale() { // Resin/tries multiplier.
				if(this.get('origin') != 'strongbox')
					return this.get('dropChance');
				else
					return this.get('tries');
			},
			anySet: {
				get() { return !this.get('strict'); },
				set(value) { this.set('strict', !value); },
			}
		},
		statWeights(slot) {
			return slot > 1 ? weights.stat[slot.toString()] : null;
		},
		bonusWeights(slot, stat) {
			let group = '*';
			let result = null;
			switch(slot.toString()) {
				case '4':
					if(stat == 'cr' || stat == 'cd')
						group = 'cr_cd';
					else if(stat = 'hb')
						group = 'hb';
					result = weights.bonus[slot.toString()][group];
				break;
				case '3':
					group = stat == 'ed' ? 'ed' : '*';
					result = weights.bonus[slot.toString()][group];
				break;
				default: result = weights.bonus[slot.toString()];
			}
			return _.omit(result, stat);
		},
		checkWeights(slot, weights, bonus) {
			if(slot < 2 && !bonus)
				return;
			let w = Object.values(weights).reduce((a, b) => a + b, 0);
			if(slot == 3 && !bonus)
				w += 0.05 * 7;
			console.assert(Math.round(w * 1000) == 1000, (bonus ? 'Bonus' : 'Stat') + ' weights not complete.', w, weights);
		},
		maxBonuses(initial) {
			return this.get('bonus').length + 5 - (4 - initial);
		},
		expAmount(star5 = true, star4 = true, star3 = true) {
			switch(this.get('origin')) {
				case 'domain': return (1.065 * 3780 * star5 + 2.485 * 2520 * star4 + 3.55 * 1260 * star3) / 20 * this.get('multiplier.resin');
			}
		},
		enchantable(exp) {
			return (exp * 0.9 + exp * 0.01 * 5 + exp * 0.09 * 2) / 270475;
		},
		obtain(initial) {
			const origin = this.get('origin');
			const strict = this.get('strict');
			const slot = this.get('slot');
			const stat = this.get('stat');
			const loss = parseInt(this.get('loss'));
			const bonuses = ((v, f) => f(v))(this.get('bonus'), Ractive.DEBUG ? _.shuffle : _.identity); // Results should still same no matter of order.
			const sWeights = this.statWeights(slot);
			const bWeights = this.bonusWeights(slot, stat);

			let f = formula();
			f.add(1);

			// Type chance.
			if(origin != 'strongbox' && strict)
				f.div(2);

			// Slot chance.
			f.div(5);

			// Stat chance.
			if(slot > 1)
				f.mul(sWeights[stat]);

			// Bonus count chance.
			if(initial == 4)
				f.mul(origin == 'domain' ? formula(f => f.add(1).div(5)) : formula(f => f.add(1).div(3)));
			else
				f.mul(origin == 'domain' ? formula(f => f.add(4).div(5)) : formula(f => f.add(2).div(3)));

			// Bonus chances.
			if(bonuses.length > (initial + loss) || bonuses.length < 1)
				return new Formula();

			for(let i = 0; i < bonuses.length; i++)
				f.mul(formula(f => f.add(bWeights[bonuses[i]]).mul(Math.min(initial + loss, 4) - i)));

			if(Ractive.DEBUG) {
				this.checkWeights(slot, sWeights, false);
				this.checkWeights(slot, bWeights, true);
				console.log(initial, parseInt(slot), stat, bonuses, sWeights, bWeights);
			}
			return f;
		},
		enchant(initial) {
			const loss = parseInt(this.get('loss'));
			const bonuses = this.get('bonus').length;
			return loss < 1 && initial < 4 ? formula() : //(1/4 * bonuses)**(5 - loss);
				formula().add(formula().add(formula().add(1).div(4)).mul(bonuses)).pow(5 - loss);
		},
		format(n) {
			switch(this.get('format')) {
				case 'auto': return n < 0.01 || n >= 1 ? this.fraction(n) : this.percent(n, 1);
				case 'percent': return this.percent(n, 2);
				default: return this.fraction(n);
			}
		},
		percent(n, decimals = 2) {
			if(n == undefined)
				return '';

			const e = 10 ** decimals;
			return Math.round(n * 100 * e) / e + '%';
		},
		decimals(n, d = 2) {
			return Math.round(n * 10**d) / 10**d;
		},
		fraction(n) {
			if(!n)
				return '';

			let v = n >= 1 ? n : 1/n;
			if(v % 1 != 0) {
				v = this.decimals(v, v < 100 ? 2 : 0);
				return '≈ ' + (n >= 1 ? v : '1/' + v);
			} else
				return n >= 1 ? v : '1/' + v;
		},
		oncomplete() {
			this.observe(Object.keys(_default).join(' '), function(value, old, path) {
				let data = _.pick(this.get({virtual: false}), Object.keys(_default));
				localStorage.setItem(storage, JSON.stringify(data));
			}, {
				init: false,
			});
		}
	});
	ractive.on('setBonus', function(event) {
		let bonus = this.get('bonus');
		if(event.node.checked)
			bonus.push(event.node.value);
		else
			bonus = bonus.filter(v => v != event.node.value);

		if(bonus.length > 3 && this.get('loss') > 1)
			this.set('loss', 1);
		this.set('bonus', bonus);
	});
	ractive.on('setResin', function(event) {
		const resin = parseInt(event.node.value);
		const day = 24 * 60 / 8;
		const month = day * 30;
		const year = day * 365;
		this.set('multiplier.years', Math.floor(resin / year));
		this.set('multiplier.months', Math.floor(resin % year / month));
		this.set('multiplier.days', Math.round(resin % year % month / day));
	});
	ractive.on('setTime', function(event) {
		let days = parseInt(this.get('multiplier.days')) + parseInt(this.get('multiplier.months')) * 30 + parseInt(this.get('multiplier.years') * 365);
		this.set('multiplier.resin', days * 24 * 60 / 8);
	});
	ractive.on('resetData', function() {
		this.set(_default);
	});
	ractive.observe('slot', function(value, old) {
		if(value > 1) {
			const weights = Object.keys(this.statWeights(value));
			if(weights.indexOf(this.get('stat')) < 0)
				this.set('stat', null)
		} else if(value == 1)
			this.set('stat', 'atk');
		else if(value == 0)
			this.set('stat', 'hp');
	});
	ractive.observe('stat', function(value, old) {
		let bonus = this.get('bonus');
		if(bonus.indexOf(value) >= 0)
			this.set('bonus', bonus.filter(v => v != value));
	});
}
