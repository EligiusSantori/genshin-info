function getFirstOr(object, keys, value) {
	for(let key of keys)
		if(!_.isNil(object[key])) // key in object | _.get
			return object[key];
	return value;
}
function partsByKey(object, ...parts) {
	return _.reduce(object, (r, v, k) => {
		let i = parts.reduce((j, p, i) => j == parts.length && ((_.isArray(p) && p.includes(k)) || p == k) ? i : j, parts.length);
		_.isNil(r[i]) ? r[i] = { [k]: v } : r[i][k] = v;
		return r;
	}, Array.from(Array(parts.length + 1), () => ({ })));
}
function partsByKeyIntoArray(object, ...parts) {
	return _.reduce(object, (r, v, k) => {
		let i = parts.reduce((j, p, i) => j == parts.length && ((_.isArray(p) && p.includes(k)) || p == k) ? i : j, parts.length);
		_.isNil(r[i]) ? r[i] = [v] : r[i].push(v);
		return r;
	}, Array.from(Array(parts.length + 1), () => []));
}
/*function applyToArray(functions, values, spread = false) {
	return _.zipWith(functions, values, (f, v) => spread ? f(...v) : f(v));
}*/

class Artifact {
	static average = Object.fromEntries(_.map(db.stats.artifact.rolls, (v, k) => [_.kebabCase(k), _.mean(v)]));
	static elements = _.map(db.elements, v => _.kebabCase(v.name));
	static expand(stats, self = true) {
		return _.transform(stats, (r, s) => {
			switch(s) {
				case 'bd': r.push('hp', 'atk', 'def'); self && r.push(s); break;
				case 'ed': r.push(...this.elements); self && r.push(s); break;
				case 'pd': r.push('physical'); self && r.push(s); break;
				case 'cv': r.push('cr', 'cd'); self && r.push(s); break;
				default: r.push(s);
			}
		}, []);
	}
	static shorten(stats, self = true) {
		return _.transform(stats, (r, s) => {
			switch(true) {
				case ['hp', 'atk', 'def'].includes(s): r.push('bd'); self && r.push(s); break;
				case this.elements.includes(s): r.push('ed'); self && r.push(s); break;
				case 'physical' == s: r.push('pd'); self && r.push(s); break;
				case ['cr', 'cd'].includes(s): r.push('cv'); self && r.push(s); break;
				default: r.push(s);
			}
		}, []);
	}
	static dummy(multipliers, precision) {
		if(_.isEmpty(multipliers) && !_.isNil(precision))
			multipliers = _.mapValues(this.average, () => 1);
		return _.isEmpty(multipliers) ? this.average : _.mapValues(multipliers, (m, k) =>
			_.isNil(precision) ? m * this.average[k] : _.round(m * this.average[k], precision));
	}

	constructor() {
		[this.set, this.slot, this.affix, this.level] = [null, 0, null, 0];
		Object.assign(this, _.mapValues(this.constructor.average, () => null));
	}

	valid() {
		let a = new this.constructor();
		a.level = parseInt(this.level);
		a.slot = parseInt(this.slot);
		a.set = this.set || null;
		a.affix = this.affix != 'hp_atk' ? this.affix : null;
		for (let k in this.constructor.average)
			a[k] = (_.isString(this[k]) || _.isFinite(this[k])) && k != this.affix ? parseFloat(this[k]) : null;
		return a;
	}

	setIn(...sets) { return sets.includes(this.set); }
	flower_plume() { return this.slot < 2; }
	sands() { return this.slot == 2; }
	goblet() { return this.slot == 3; }
	circlet() { return this.slot == 4; }
	affixIn(...affixes) { return this.constructor.expand(affixes, true).includes(this.affix); }

	getStats(predicate = _.identity) {
		return _.mapValues(this.constructor.average, (v, k) => predicate(this[k], k));
	}
	getRolls(precision = null) {
		const predicate = _.isNil(precision) ? _.identity : v => _.round(v, precision);
		return _.transform(this.constructor.average, (r, v, k) => r[k] = predicate(_.isFinite(this[k]) ? this[k] / v : 0), { });
	}

	toDisplay() {
		return _.pickBy(this.getStats(v => _.round(v, 1)), v => v > 0);
		// return _.mapKeys(stats, (v, k) => k != 'em' ? k + '%' : k);
	}

	// toString() {
	// 	return '(' + _.join(_.map(stats, (v, k) => k.toUpperCase() + ': ' + (k != 'em' ? v + '%' : v), ' | ') + ')';
	// }
}

class Ruleset {
	static quality(artifact, coeffs, precision) {
		const average = Artifact.average, q = 0
			+ getFirstOr(coeffs, ['cd'], 1) * (artifact.cd || 0)
			+ getFirstOr(coeffs, ['cr'], 1) * (artifact.cr || 0)
			+ getFirstOr(coeffs, ['atk', 'bd'], 1) * (artifact.atk || 0)
			+ getFirstOr(coeffs, ['def', 'bd'], 1) * ((artifact.def || 0) / average.def * average.atk)
			+ getFirstOr(coeffs, ['hp', 'bd'], 1) * (artifact.hp || 0)
			+ getFirstOr(coeffs, ['er'], 1) * (artifact.er || 0)
			+ getFirstOr(coeffs, ['em'], 1) * (artifact.em || 0) / average.em * average.cd;
		return _.isNil(precision) ? q : _.round(q, precision);
	}
	static rollsSumMax(artifact, sum, max, mergeCV = false, useFormula = true, precision = 1) {
		sum = Artifact.expand(!_.isArray(sum) && !_.isNil(sum) ? [sum] : (sum || []), false);
		max = Artifact.expand(!_.isArray(max) && !_.isNil(max) ? [max] : (max || []), false);

		let rolls = artifact.getRolls(precision);
		if(mergeCV) rolls = { ..._.omit(rolls, ['cd', 'cr']), cv: (rolls.cd || 0) + (rolls.cr || 0) };

		let [toSum, toMax, rest] = partsByKeyIntoArray(rolls, sum, max);
		[toSum, toMax] = [_.isEmpty(sum) ? rest : toSum, _.isEmpty(max) ? rest : toMax];

		const [fnSum, fnMax] = useFormula ? [formula.add, formula.max] : [math.add, math.max];
		return [toSum.length > 1 ? fnSum(...toSum) : (toSum[0] || 0), toMax.length > 1 ? fnMax(...toMax) : (toMax[0] || 0)];
	}
	static resetIn(coeffs, ...stats) {
		return Artifact.expand(stats, true).reduce(
			(r, s) => { if(r[s] > 0) r[s] = 0; return r; },
			_.clone(coeffs));
	}
	static disabledIn(coeffs, stat) {
		return getFirstOr(coeffs, Artifact.shorten([stat], true).reverse(), -1) == 0;
	}
	static scope(artifact, coeffs) {
		let average = Artifact.dummy(), rolls = artifact.getRolls(),
			scope = _.map(average, (v, k) => [_.upperCase(k), _.isFinite(artifact[k]) ? artifact[k] : 0]);
		return Object.fromEntries([...scope,
			..._.map(coeffs, (v, k) => ['COEFF_' + _.upperCase(k), v]),
			..._.map(average, (v, k) => ['AVG_' + _.upperCase(k), v]),
			..._.map(rolls, (v, k) => ['ROLLS_' + _.upperCase(k), v]),
			['SET', artifact.set || ''],
			['SLOT', artifact.slot || 0], // TODO bool constants.
			['AFFIX', artifact.affix || ''],
			['LEVEL', artifact.level || 0],
			['Q', this.quality(artifact, coeffs)],
		]);
	}

	#coeffs = { };
	#rules = { };
	#childs = [];

	constructor(coeffs, rules, childs) {
		this.#coeffs = _.isEmpty(coeffs) ? { } : coeffs;
		this.#rules = this.#parseRules(_.isEmpty(rules) ? { } : rules);
		this.#childs = _.isEmpty(childs) ? [] : childs;
	}
	#parseRules(rules) {
		return _.mapValues(rules, r => _.isString(r) ? math.parse(r) : r);
  }

  *for(artifact, parent) {
		const coeffs = _.assign({ }, parent, _.isFunction(this.#coeffs) ? this.#coeffs(artifact) : this.#coeffs);
		for(const name in this.#rules)
			yield { name: name, rule: this.#rules[name], coeffs };
		for(let rs of this.#childs)
			if((rs = _.isFunction(rs) ? rs(artifact) : rs) instanceof this.constructor)
				for(const r of rs.for(artifact, coeffs))
					yield r;
  }
}
