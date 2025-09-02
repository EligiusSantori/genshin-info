var ruleset;
((fraction, round, quality, average) => { // Shortcuts.
	const usedByHealers = [...db.stats.sets.hb, 'NO', 'VV', 'DM', 'SHCC'];

	ruleset = new Ruleset({ cd: 1, cr: 2, bd: fraction(3, 4), er: fraction(1, 3), em: fraction(1, 3) }, {

		// Global rules.
		'ER ≥ 30% (off-set)': (a) => a.er >= 30,
		'EM ≥ 119 (off-set)': (a) => round(a.em) >= round(average().em * 6),
		'EM<sub>sgc</sub> | Q ≥ 33 (off-set)': (a) => a.affixIn('em') && formula.largerEq(round(quality(a)), round(average().cd * 5)),


		// Flower & plume rules.
		'Q<sub>fp</sub> ≥ 37': (a, c) => a.flower_plume() && formula.largerEq(quality(a, c, 1), quality(average({atk: 3, cd: 4}), c, 1)), // Qmin = coeff(3BD)+4CD.

		// Sands rules.
		'BD<sub>s</sub> | Q ≥ 40 (off-set)': (a) => a.sands() && a.affixIn('bd') && formula.largerEq(round(quality(a)), round(average().cd * 6)),
		'ER<sub>s</sub> | Q ≥ 33 (off-set)': (a) => a.affixIn('er') && formula.largerEq(round(quality(a)), round(average().cd * 5)),
		'ATK<sub>s</sub> | Q ≥ 26': (a, c) => a.sands() && a.affixIn('atk') && formula.largerEq(round(quality(a, c)), round(average().cd * 4)),
		'HP&DEF<sub>s</sub> | Q ≥ 33': (a, c) => a.sands() && a.affixIn('hp', 'def') && formula.largerEq(round(quality(a, c)), round(average().cd * 5)),
		'ER<sub>s</sub> | Q ≥ 24': (a, c) => a.affixIn('er') && formula.largerEq(quality(a, c, 1), quality(average({atk: 3, cd: 2}), c, 1)), // Qmin = coeff(3BD)+2CD.

		// Goblet rules.
		'BD<sub>g</sub> | Q ≥ 35 (off-set)': (a) => a.goblet() && a.affixIn('bd') && formula.largerEq(round(quality(a)), 35),
		'ED<sub>g</sub> | Q ≥ 30 (off-set)': (a) => a.goblet() && a.affixIn('ed') && formula.largerEq(round(quality(a)), 30),
		'PD<sub>g</sub> | Q ≥ 35 (off-set)': (a) => a.goblet() && a.affixIn('pd') && formula.largerEq(round(quality(a)), 35),

		// Circlet rules.
		'CV<sub>c</sub> | Q ≥ 27 (off-set)': (a) => a.affixIn('cd', 'cr') && formula.largerEq(round(quality(a)), round(quality(average({atk: 2, cd: 3})))), // Qmin = coeff(2BD)+3CD.
		'CV<sub>c</sub> | Q ≥ 20': (a, c) => a.affixIn('cd', 'cr') && formula.largerEq(round(quality(a, c)), round(average().cd * 3)),
		'BD<sub>c</sub> | Q ≥ 45 (off-set)': (a) => a.circlet() && a.affixIn('bd') && formula.largerEq(round(quality(a)), 45),
		'BD<sub>c</sub> | Q ≥ 40': (a, c) => a.circlet() && a.affixIn('bd') && formula.largerEq(round(quality(a, c)), round(average().cd * 6)),
		'HB<sub>c</sub> | CV/BD/ER/EM ≥ ×5 (off-set)': (a) => a.affixIn('hb') && formula.largerEq((rolls =>
			formula.max(...[... _.values(_.omit(rolls, ['cd', 'cr'])), rolls.cd + rolls.cr]))(a.getRolls(1)), 5),
		'HB<sub>c</sub> | ER+CV/BD/ER/EM ≥ ×6 (off-set)': (a) => a.affixIn('hb') && formula.largerEq((rolls => formula.add(rolls.er,
			formula.max(...[... _.values(_.omit(rolls, ['cd', 'cr', 'er'])), rolls.cd + rolls.cr])))(a.getRolls(1)), 6),
		'HB<sub>c</sub> | ER+CV/BD/ER/EM ≥ ×3': (a, c) => a.affixIn('hb') && (a.setIn(...usedByHealers)) && formula.largerEq((rolls =>
			formula.add(rolls.er, formula.max(...[... _.values(_.omit(rolls, ['cd', 'cr', 'er'])), rolls.cd + rolls.cr])))(a.getRolls(1)), 3),

		// Multiset rules.
		//'': (a, c) => false,
	}, {
		// NO: new Ruleset(null, {

		// }),
		// ESF: new Ruleset(null, {

		// }),
	});

	['MH', 'OC'].map(s => ruleset.setCoeff('cr', math.multiply(ruleset.getCoeff('bd', s), 2), s)); // coeff(CR) = coeff(BD) * 2
	['BS'].map(s => ruleset.setCoeff('cr', 1, s)); // coeff(CR) = coeff(CD)
	['ESF', 'NO'].map(s => ruleset.setCoeff('er', ruleset.getCoeff('bd', s), s)); // coeff(ER) = coeff(BD)
	['VV', 'WT', 'TF', 'DM'].map(s => ruleset.setCoeff('em', ruleset.getCoeff('bd', s), s)); // coeff(EM) = coeff(BD)
	['CWF', 'GD', 'FPL'].map(s => ruleset.setCoeff('em', 1, s)); // coeff(EM) = coeff(CD)
	ruleset.setCoeff('hp', 0, ...db.stats.sets.atk).setCoeff('def', 0, ...db.stats.sets.atk)
		.setCoeff('hp', 0, ...db.stats.sets.def).setCoeff('def', 0, ...db.stats.sets.hp);

})(math.fraction, math.round, (a, c, p) => ruleset.quality(a, c, p), Ruleset.average);
