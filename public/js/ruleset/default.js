const ruleset = new Ruleset({ cd: 1, cr: 2, bd: math.fraction(3, 4), er: math.fraction(1, 3), em: math.fraction(1, 3) }, {
	'Quality > 35': (a, c) => formula.larger(math.round(Ruleset.quality(a, c), 2), 35, true),
	'Energy recharge > 30%': (a, c) => a.er > 30,
	'Elemental mastery > 120': (a, c) => math.round(a.em) >= Artifact.average.em * 6,
	// 'Elemental mastery > 100': 'EM >= 100', // TODO for specific sets.
	// '': (a, c) => false,
}, {
	GF: new Ruleset(null, {

	}),
	ESF: new Ruleset(null, {

	}),
});

['MH', 'OC'].map(s => ruleset.setCoeff('cr', math.multiply(ruleset.getCoeff('bd', s), 2), s)); // coeff(CR) = coeff(BD) * 2
['BS'].map(s => ruleset.setCoeff('cr', 1, s)); // coeff(CR) = coeff(CD)
['ESF', 'NO'].map(s => ruleset.setCoeff('er', ruleset.getCoeff('bd', s), s)); // coeff(ER) = coeff(BD)
['VV', 'WT', 'TF', 'DM'].map(s => ruleset.setCoeff('em', ruleset.getCoeff('bd', s), s)); // coeff(EM) = coeff(BD)
['CWF', 'GD', 'FPL'].map(s => ruleset.setCoeff('em', 1, s)); // coeff(EM) = coeff(CD)
