var ruleset;
((fraction, round, quality, average) => { // Shortcuts.
	ruleset = new Ruleset({ cd: 1, cr: 2, bd: fraction(3, 4), er: fraction(1, 3), em: fraction(1, 3) }, {

		// Global rules.
		'ER ≥ 30% (off-set)': (a, c) => a.er >= 30,
		'EM ≥ 119 (off-set)': (a, c) => round(a.em) >= round(average.em * 6),
		'EM<sub>sgc</sub> | Q ≥ 33 (off-set)': (a, c) => a.affixIn('em') && formula.largerEq(round(quality(a, c)), round(average.cd * 5)),

		// Flower & plume rules.
		'Q<sub>fp</sub> ≥ 37': (a, c) => a.flower_plume() && formula.largerEq(round(quality(a, c), 1), round(average.atk * 3 * c.bd + average.cd * 4, 1)), // Qmin = coeff(3BD)+4CD.

		// Sands rules.
		'BD<sub>s</sub> | Q ≥ 40 (off-set)': (a, c) => a.sands() && a.affixIn('bd') && formula.largerEq(round(quality(a, c)), 40),
		'ER<sub>s</sub> | Q ≥ 33 (off-set)': (a, c) => a.affixIn('er') && formula.largerEq(round(quality(a, c)), round(average.cd * 5)),
		'ATK<sub>s</sub> | Q ≥ 26': (a, c) => a.sands() && a.affixIn('atk') && formula.largerEq(round(quality(a, c)), round(average.cd * 4)),
		'HP&DEF<sub>s</sub> | Q ≥ 33': (a, c) => a.sands() && a.affixIn('hp', 'def') && formula.largerEq(round(quality(a, c)), round(average.cd * 5)),
		'ER<sub>s</sub> | Q ≥ 24': (a, c) => a.affixIn('er') && formula.largerEq(round(quality(a, c), 1), round(average.atk * 3 * c.bd + average.cd * 2, 1)), // Qmin = coeff(3BD)+2CD.

		// Goblet rules.
		'BD<sub>g</sub> | Q ≥ 35 (off-set)': (a, c) => a.goblet() && a.affixIn('bd') && formula.largerEq(round(quality(a, c)), 35),
		'ED<sub>g</sub> | Q ≥ 30 (off-set)': (a, c) => a.goblet() && a.affixIn('ed') && formula.largerEq(round(quality(a, c)), 30),
		'PD<sub>g</sub> | Q ≥ 35 (off-set)': (a, c) => a.goblet() && a.affixIn('pd') && formula.largerEq(round(quality(a, c)), 35),

		// Circlet rules.
		'CV<sub>c</sub> | Q ≥ 20': (a, c) => a.affixIn('cd', 'cr') && formula.largerEq(round(quality(a, c)), round(average.cd * 3)),
		'CV<sub>c</sub> | Q ≥ 40': (a, c) => a.circlet() && a.affixIn('bd') && formula.largerEq(round(quality(a, c)), round(average.cd * 6)),
		'CV<sub>c</sub> | Q ≥ 27 (off-set)': (a, c) => a.affixIn('cd', 'cr') && formula.largerEq( // Qmin = coeff(2BD)+3CD.
			round(quality(a, ruleset.setless(c, 'bd', 'hp', 'atk', 'def'))), round(average.atk * 2 * c.bd + average.cd * 3)),
		'HB<sub>c</sub> | CV/BD/ER/EM ≥ ×5 (off-set)': (a, c) => a.affixIn('hb') && round(math.max(
			[... _.map(['hp', 'atk', 'def', 'em', 'er'], k => a[k] / average[k]), (a.cd + a.cr * ruleset.setless(c, 'cr').cr) / average.cd])) >= 5,
		'HB<sub>c</sub> | ER+CV/BD/ER/EM ≥ ×6 (off-set)': (a, c) => a.affixIn('hb') && round(a.er / average.er + math.max(
			[... _.map(['hp', 'atk', 'def', 'em'], k => a[k] / average[k]), (a.cd + a.cr * ruleset.setless(c, 'cr').cr) / average.cd])) >= 6,

	}, {
		// GF: new Ruleset(null, {

		// }),
		// ESF: new Ruleset(null, {

		// }),
	});

	['MH', 'OC'].map(s => ruleset.setCoeff('cr', math.multiply(ruleset.getCoeff('bd', s), 2), s)); // coeff(CR) = coeff(BD) * 2
	['BS'].map(s => ruleset.setCoeff('cr', 1, s)); // coeff(CR) = coeff(CD)
	['ESF', 'NO'].map(s => ruleset.setCoeff('er', ruleset.getCoeff('bd', s), s)); // coeff(ER) = coeff(BD)
	['VV', 'WT', 'TF', 'DM'].map(s => ruleset.setCoeff('em', ruleset.getCoeff('bd', s), s)); // coeff(EM) = coeff(BD)
	['CWF', 'GD', 'FPL'].map(s => ruleset.setCoeff('em', 1, s)); // coeff(EM) = coeff(CD)
})(math.fraction, math.round, Ruleset.quality, Artifact.average);
