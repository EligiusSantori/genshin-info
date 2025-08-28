class Artifact {
	static average = db.artifact.minor.average;
	static maxLevel = 20;

	constructor() {
		[this.set, this.slot, this.affix, this.level] = [null, 0, null, 0];
		Object.assign(this, _.mapValues(this.constructor.average, () => null));
	}

	getStats(predicate = _.identity) {
		return _.mapValues(this.constructor.average, (v, k) => predicate(this[k], k));
	}

	toString() {
		const stats = _.pickBy(this.getStats(v => _.round(v, 1)), v => v > 0);
		return '(' + _.join(_.map(stats, (v, k) => k.toUpperCase() + '=' + v), ' ') + ')';
	}
}

class Ruleset {
	static quality(artifact, coeffs) { return 0
		+ (coeffs.cd || 1) * (artifact.cd || 0)
		+ (coeffs.cr || 1) * (artifact.cr || 0)
		+ (coeffs.bd || 1) * (artifact.atk || 0)
		+ (coeffs.bd || 1) * ((artifact.def || 0) / Artifact.average.def * Artifact.average.atk)
		+ (coeffs.bd || 1) * (artifact.hp || 0) / Artifact.average.hp * Artifact.average.atk
		+ (coeffs.er || 1) * (artifact.er || 0)
		+ (coeffs.em || 1) * (artifact.em || 0) / Artifact.average.em * Artifact.average.cd;
	}
	// static parse(rule, artifact, coeffs) {
	// 	const expr = math.parse(rule);
	// 	_.map(artifact.getStats(), (v, k) => expr.set(k.toUpperCase(), v));
	// 	expr.set('Q', Ruleset.quality(artifact, coeffs));
	// 	return expr;
	// }
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
		Object.assign(this, { coeffs, rules, sets });
	}

	quality() {
		return this.constructor.quality(...arguments);
	}

	getCoeffs(set = null) {
		return _.defaults({ }, this.sets?.[set]?.coeffs, this.coeffs);
	}

	// getCoeff(name, set = null) {

	// }

	// setCoeff(name, set = null) {

	// }

	getRules(set = null) {
		return _.defaults({ }, this.sets?.[set]?.rules, this.rules);
	}

	copy(sets, from, to, predicate = _.identity) {
		sets.map(set => _.set(this, `sets.${set}.coeffs.${to}`,
			predicate(this.sets?.[set]?.coeffs?.[from] || this.coeffs?.[from])));
	}
}
