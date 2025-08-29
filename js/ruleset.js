class Artifact {
	static average = Object.fromEntries(_.map(db.chances.artifact.rolls, (v, k) => [_.kebabCase(k), _.mean(v)]));
	static maxLevel = 20;

	constructor() {
		[this.set, this.slot, this.affix, this.level] = [null, 0, null, 0];
		Object.assign(this, _.mapValues(this.constructor.average, () => null));
	}

	valid() {
		let a = _.clone(this);
		a.level = parseInt(a.level);
		a.slot = parseInt(a.slot);
		a.set = a.set || null;
		if(a.affix && a.affix in a)
			a[a.affix] = null;
		if(a.affix == 'hp_atk')
			a.affix = null;
		return a;
	}

	getStats(predicate = _.identity) {
		return _.mapValues(this.constructor.average, (v, k) => predicate(this[k], k));
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
	static quality(artifact, coeffs) { return 0
		+ (coeffs.cd || 1) * (artifact.cd || 0)
		+ (coeffs.cr || 1) * (artifact.cr || 0)
		+ (coeffs.bd || 1) * (artifact.atk || 0)
		+ (coeffs.bd || 1) * ((artifact.def || 0) / Artifact.average.def * Artifact.average.atk)
		+ (coeffs.bd || 1) * (artifact.hp || 0)
		+ (coeffs.er || 1) * (artifact.er || 0)
		+ (coeffs.em || 1) * (artifact.em || 0) / Artifact.average.em * Artifact.average.cd;
	}
	static scope(artifact, coeffs) {
		let scope = _.map(Artifact.average, (v, k) => [_.upperCase(k), _.isFinite(artifact[k]) ? artifact[k] : 0]);
		return Object.fromEntries([
			['SET', artifact.set || ''],
			['SLOT', artifact.slot || 0],
			['AFFIX', artifact.affix || ''],
			['LEVEL', artifact.level || 0],
			['Q', this.quality(artifact, coeffs)],
		].reduce((a, v) => { a.push(v); return a; }, scope));
	}

	constructor(coeffs, rules, sets) {
		Object.assign(this, { coeffs, sets });
		this.rules = this.#parseRules(rules);
	}

	#parseRules(rules) {
		return _.mapValues(rules, r => _.isString(r) ? math.parse(r) : r);
  }

	quality() {
		return this.constructor.quality(...arguments);
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
