const ruleset = new Ruleset({ cd: 1, cr: 2, bd: math.fraction(3, 4), er: math.fraction(1, 3), em: math.fraction(1, 3) }, {
	'Quality > 35': (a, c) => formula.larger(math.round(Ruleset.quality(a, c), 2), 35, true),
	'Energy recharge > 30%': (a, c) => a.er > 30,
	'Elemental mastery > 100': 'EM >= 100',
	// '': (a, c) => false,
}, {
	GF: new Ruleset(null, {

	}),
	ESF: new Ruleset(null, {

	}),
});

ruleset.copy(['MH', 'OC'], 'bd', 'cr', c => math.multiply(c, 2)); // coeff(CR) = coeff(BD) * 2
['BS'].map(s => _.set(ruleset, `sets.${s}.coeffs.cr`, 1)); // coeff(CR) = coeff(CD)
ruleset.copy(['ESF', 'NO'], 'bd', 'er'); // coeff(ER) = coeff(BD)
ruleset.copy(['VV', 'WT', 'TF', 'DM'], 'bd', 'em'); // coeff(EM) = coeff(BD)
['CWF', 'GD', 'FPL'].map(s => _.set(ruleset, `sets.${s}.coeffs.em`, 1)); // coeff(EM) = coeff(CD)
