class Artifact {
	static average = Object.fromEntries(_.map(db.stats.artifact.rolls, (v, k) => [_.kebabCase(k), _.mean(v)]));
	static elements = _.map(db.elements, v => _.kebabCase(v.name));
	static expand(stat) { return { bd: ['hp', 'atk', 'def'], ed: this.elements }[stat] || [stat]; }

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

	setIn(...sets) { return sets.indexOf(this.set) >= 0; }
	flower_plume() { return this.slot < 2; }
	sands() { return this.slot == 2; }
	goblet() { return this.slot == 3; }
	circlet() { return this.slot == 4; }
	affixIn(...affixes) { return _.transform(affixes, (r, v) => r.push(...this.constructor.expand(v)), []).indexOf(this.affix) >= 0; }

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
	static #defaults(object, value, ...keys) {
		const result = keys.reduce((r, k) => _.isNil(r) && !_.isNil(object[k]) ? object[k] : r, null);
		return _.isNil(result) ? value : result;
	}
	static quality(artifact, coeffs, precision) {
		const average = Artifact.average, q = 0
			+ this.#defaults(coeffs, 1, 'cd') * (artifact.cd || 0)
			+ this.#defaults(coeffs, 1, 'cr') * (artifact.cr || 0)
			+ this.#defaults(coeffs, 1, 'atk', 'bd') * (artifact.atk || 0)
			+ this.#defaults(coeffs, 1, 'def', 'bd') * ((artifact.def || 0) / average.def * average.atk)
			+ this.#defaults(coeffs, 1, 'hp', 'bd') * (artifact.hp || 0)
			+ this.#defaults(coeffs, 1, 'er') * (artifact.er || 0)
			+ this.#defaults(coeffs, 1, 'em') * (artifact.em || 0) / average.em * average.cd;
		return _.isNil(precision) ? q : _.round(q, precision);
	}
	static average(multipliers, precision) {
		if(_.isEmpty(multipliers) && !_.isNil(precision))
			multipliers = _.mapValues(Artifact.average, () => 1);
		return _.isEmpty(multipliers) ? Artifact.average : _.mapValues(multipliers, (m, k) =>
			_.isNil(precision) ? m * Artifact.average[k] : _.round(m * Artifact.average[k], precision));
	}
	static scope(artifact, coeffs) {
		let average = this.average(), rolls = artifact.getRolls(),
			scope = _.map(average, (v, k) => [_.upperCase(k), _.isFinite(artifact[k]) ? artifact[k] : 0]);
		return Object.fromEntries([...scope,
			..._.map(coeffs, (v, k) => ['COEFF_' + _.upperCase(k), v]),
			..._.map(average, (v, k) => ['AVG_' + _.upperCase(k), v]),
			..._.map(rolls, (v, k) => ['ROLLS_' + _.upperCase(k), v]),
			['SET', artifact.set || ''],
			['SLOT', artifact.slot || 0],
			['AFFIX', artifact.affix || ''],
			['LEVEL', artifact.level || 0],
			['Q', this.quality(artifact, coeffs)],
		]);
	}

	constructor(coeffs, rules, sets) {
		Object.assign(this, { coeffs, sets });
		this.rules = this.#parseRules(rules);
	}
	#parseRules(rules) {
		return _.mapValues(rules, r => _.isString(r) ? math.parse(r) : r);
  }

	quality(artifact, coeffs, precision) {
		return this.constructor.quality(artifact, _.isEmpty(coeffs) ? this.getCoeffs() : coeffs, precision);
	}
	average() { return this.constructor.average(...arguments); }
	statsSumMax(stats, sum, max, mergeCV = true, formula = true) {
		const [fnSum, fnMax] = formula ? [formula.add, formula.max] : [math.add, math.max];
		let [toSum, toMax] = splitMergeApply(stats, _.isArray(sum) || _.isNil(sum) ? sum : [sum], mergeCV ? ['cd', 'cr'] : null);
		return [toSum.length > 1 ? fnSum(...toSum) : toSum[0], fnMax(toMax)];
	}

	getCoeffs(set = null) {
		return _.defaults({ }, this.sets?.[set]?.coeffs, this.coeffs);
	}
	getCoeff(name, set = null) {
		return this.sets?.[set]?.coeffs?.[name] || this.coeffs?.[name]
	}
	setCoeff(name, value, ...sets) {
		if(_.isEmpty(sets.map(set => _.set(this, `sets.${set}.coeffs.${name}`, value))))
			_.set(this, `coeffs.${name}`, value);
		return this;
	}
	getRules(set = null) {
		return _.defaults({ }, this.sets?.[set]?.rules, this.rules);
	}
}

function applyToArray(functions, values, spread = false) {
	return _.zipWith(functions, values, (f, v) => spread ? f(...v) : f(v));
}
function splitByKey(object, ...parts) {
	return _.reduce(object, (r, v, k) => {
		let i = parts.reduce((j, p, i) => j == parts.length && ((_.isArray(p) && p.indexOf(k) >= 0) || p == k) ? i : j, parts.length);
		_.isNil(r[i]) ? r[i] = { [k]: v } : r[i][k] = v;
		return r;
	}, Array.from(Array(parts.length + 1), () => ({ })));
}
function splitByKeyIntoArray(object, ...parts) {
	return _.reduce(object, (r, v, k) => {
		let i = parts.reduce((j, p, i) => j == parts.length && ((_.isArray(p) && p.indexOf(k) >= 0) || p == k) ? i : j, parts.length);
		_.isNil(r[i]) ? r[i] = [v] : r[i].push(v);
		return r;
	}, Array.from(Array(parts.length + 1), () => []));
}
function splitMergeApply(object, split = null, merge = null, apply = null, spread = false) {
	let [s, m, r] = splitByKeyIntoArray(object, split || [], merge || []);
	_.isEmpty(m) || r.push(_.sum(m));
	if(_.isFunction(apply)) {
		s = spread ? apply(...s) : apply(s);
		r = spread ? apply(...r) : apply(r);
	}
	return [s, r];
}
