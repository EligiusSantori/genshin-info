var ruleset;
(() => {
	// Shortcuts.
	let sets = _.cloneDeep(db.stats.sets);
	const elementalWide = ['GF', 'NO', 'RB', 'TM', 'ESF', 'MH', 'GT', 'SHCC', 'OC'];
	sets.pyro.push('SR', 'FPL', 'VG', 'FHW', 'UR', 'LNO'); // Thoma, Yoimiya / Hu Tao, Dehya, Arlecchino, Gaming, burgeon, burning.
	sets.hydro.push('OHC', 'FPL', 'SDP'); // Kokomi, Furina, Sigewinne, bloom.
	sets.electro.push('EO', 'FPL', 'FHW', 'LNO'); // Yae Miko, Keqing, Fischl, Clorinde, Varesa, hyperbloom.
	sets.anemo.push('WT', 'VH'); // Chasca, Mizuki, Xiao, Heizou.
	sets.dendro.push('WT', 'GD', 'FPL', 'UR'); // Tighnari, Nahida, bloom, burning.
	sets.pd.push('OHC'); // Qiqi.
	const usedByHealers = [...sets.hb, 'NO', 'VV', 'DM', 'SHCC'];
	const wantsErAtk = [...sets.atk, 'NO', 'MB', 'VV', 'AP', 'DM', 'SDP', 'SHCC'];
	const wantsErDef = [...sets.def, 'NO', 'MB', 'VV', 'AP', 'DM', 'SDP', 'SHCC'];
	const wantsErHp = [...sets.hp, 'NO', 'MB', 'VV', 'AP', 'DM', 'SDP', 'SHCC'];
	const wantsErEm = [...sets.em, 'NO', 'MB', 'VV', 'DM', 'SDP', 'SHCC'];

	const [average, summax] = [Artifact.average, Ruleset.rollsSumMax];
	const [fraction, round] = [math.fraction, math.round].map(f => _.bind(f, math));
	const [largerEq, add, max] = [formula.largerEq, formula.add, formula.max].map(f => _.bind(f, formula));
	const quality = (a, c, p) => ruleset.quality(a, c, p);
	const qMin = (r, p) => quality(Ruleset.average(r), null, p);
	const _check = function(a, c, fn) { return !ruleset.affixDisabled(a, c) && fn(a, a.affixIn('bd') ? ruleset.resetBaseDamage(c) : c); };
	const offset = (fn) => (a) => _check(a, ruleset.getCoeffs(), fn);
	const inset = (fn, strict = false) => function(a, c) {
		if(strict && a.affixIn('ed', 'pd') && !_.includes([...(sets[a.affix] || []), ...elementalWide], a.set || '')) return false;
		if(strict && a.affixIn('hb') && !a.setIn(...usedByHealers)) return false;
		return _check(a, c, fn);
	}

	ruleset = new Ruleset({ cd: 1, cr: 2, bd: fraction(3, 4), er: fraction(1, 3), em: fraction(1, 3) }, {

		// Slotless rules.
		'ER ≥ 30% (off-set)': offset((a, c) => a.er >= 30),
		'EM ≥ 119 (off-set)': offset((a, c) => round(a.em) >= round(average.em * 6)),
		'EM[~sgc~] | Q ≥ 33 (off-set)': offset((a, c) => a.affixIn('em') && largerEq(round(quality(a, c)), round(average.cd * 5))),

		// Flower & plume rules.
		'Q[~fp~] ≥ 37': inset((a, c) => a.flower_plume() && largerEq(quality(a, c, 1), qMin({atk: 3, cd: 4}, 1))), // Qmin = 3BD+4CD.

		// Sands rules.
		'BD[~s~] | Q ≥ 40 (off-set)': offset((a, c) => a.sands() && a.affixIn('bd') && largerEq(round(quality(a, c)), round(average.cd * 6))),
		'ATK[~s~] | Q ≥ 26': inset((a, c) => a.sands() && a.affixIn('atk') && largerEq(round(quality(a, c)), round(average.cd * 4))),
		'HP&DEF[~s~] | Q ≥ 33': inset((a, c) => a.sands() && a.affixIn('hp', 'def') && largerEq(round(quality(a, c)), round(average.cd * 5))),
		'ER[~s~] | Q ≥ 33 (off-set)': offset((a, c) => a.affixIn('er') && largerEq(round(quality(a, c)), round(average.cd * 5))),
		'ER[~s~] | Q ≥ 24': inset((a, c) => a.affixIn('er') && largerEq(quality(a, c, 1), qMin({atk: 3, cd: 2}, 1))), // Qmin = 3BD+2CD.

		// Goblet rules.
		'ED[~g~] | Q ≥ 30 (off-set)': offset((a, c) => a.goblet() && a.affixIn('ed') && largerEq(round(quality(a, c)), 30)),
		'ED[~g~] | Q ≥ 25': inset((a, c) => a.goblet() && a.affixIn('ed') && largerEq(round(quality(a, c)), 25), true),
		'BD[~g~] | Q ≥ 35 (off-set)': offset((a, c) => a.goblet() && a.affixIn('bd') && largerEq(round(quality(a, c)), 35)),
		'BD[~g~] | Q ≥ 30': inset((a, c) => a.goblet() && a.affixIn('bd') && largerEq(round(quality(a, c)), 30), true),
		'PD[~g~] | Q ≥ 35 (off-set)': offset((a, c) => a.goblet() && a.affixIn('pd') && largerEq(round(quality(a, c)), 35)),
		'PD[~g~] | Q ≥ 30': inset((a, c) => a.goblet() && a.affixIn('pd') && largerEq(round(quality(a, c)), 30), true),

		// Circlet rules.
		'CV[~c~] | Q ≥ 27 (off-set)': offset((a, c) => a.affixIn('cd', 'cr') && largerEq(round(quality(a, c)), round(qMin({atk: 2, cd: 3})))), // Qmin = 2BD+3CD.
		'CV[~c~] | Q ≥ 20': inset((a, c) => a.affixIn('cd', 'cr') && largerEq(round(quality(a, c)), round(average.cd * 3))),
		'BD[~c~] | Q ≥ 45 (off-set)': offset((a, c) => a.circlet() && a.affixIn('bd') && largerEq(round(quality(a, c)), 45)),
		'BD[~c~] | Q ≥ 40': inset((a, c) => a.circlet() && a.affixIn('bd') && largerEq(round(quality(a, c)), round(average.cd * 6))),
		'HB[~c~] | CV/BD/ER/EM ≥ ×5 (off-set)': offset((a, c) => a.affixIn('hb') && largerEq(summax(a.getRolls(1))[1], 5)),
		'HB[~c~] | ER+CV/BD/ER/EM ≥ ×6 (off-set)': offset((a, c) => a.affixIn('hb') && largerEq(add(...summax(a.getRolls(1), 'er')), 6)),
		'HB[~c~] | ER+CV/BD/ER/EM ≥ ×3': inset((a, c) => a.affixIn('hb') && largerEq(add(...summax(a.getRolls(1), 'er')), 3), true),

		// Multiset rules.
		'ATK[~fp~] | ER+ATK ≥ ×6': inset((a, c) => a.flower_plume() && a.setIn(...wantsErAtk) && largerEq(add(...summax(a.getRolls(1), 'er', 'atk')), 6)),
		'ER[~s~] | ATK ≥ ×3': inset((a, c) => a.affixIn('er') && a.setIn(...wantsErAtk) && largerEq(a.getRolls(1)['atk'], 3)),
		'ATK[~sgc~] | ER ≥ ×3': inset((a, c) => a.affixIn('atk') && a.setIn(...wantsErAtk) && largerEq(a.getRolls(1)['er'], 3)),
		'CR[~c~] | ER+ATK ≥ ×5': inset((a, c) => a.circlet() && a.setIn(...wantsErAtk) && largerEq(add(...summax(a.getRolls(1), 'er', 'atk')), 5)),

		'DEF[~fp~] | ER+DEF ≥ ×6': inset((a, c) => a.flower_plume() && a.setIn(...wantsErDef) && largerEq(add(...summax(a.getRolls(1), 'er', 'def')), 6)),
		'ER[~s~] | DEF ≥ ×3': inset((a, c) => a.affixIn('er') && a.setIn(...wantsErDef) && largerEq(a.getRolls(1)['def'], 3)),
		'DEF[~sgc~] | ER ≥ ×3': inset((a, c) => a.affixIn('def') && a.setIn(...wantsErDef) && largerEq(a.getRolls(1)['er'], 3)),
		'CR[~c~] | ER+DEF ≥ ×5': inset((a, c) => a.circlet() && a.setIn(...wantsErDef) && largerEq(add(...summax(a.getRolls(1), 'er', 'def')), 5)),

		'HP[~fp~] | ER+HP ≥ ×6': inset((a, c) => a.flower_plume() && a.setIn(...wantsErHp) && largerEq(add(...summax(a.getRolls(1), 'er', 'hp')), 6)),
		'ER[~s~] | HP ≥ ×3': inset((a, c) => a.affixIn('er') && a.setIn(...wantsErHp) && largerEq(a.getRolls(1)['hp'], 3)),
		'HP[~sgc~] | ER ≥ ×3': inset((a, c) => a.affixIn('hp') && a.setIn(...wantsErHp) && largerEq(a.getRolls(1)['er'], 3)),
		'CR[~c~] | ER+HP ≥ ×5': inset((a, c) => a.circlet() && a.setIn(...wantsErHp) && largerEq(add(...summax(a.getRolls(1), 'er', 'hp')), 5)),

		'EM[~fp~] | ER+EM ≥ ×6': inset((a, c) => a.flower_plume() && a.setIn(...wantsErEm) && largerEq(add(...summax(a.getRolls(1), 'er', 'em')), 6)),
		'EM[~fp~] | EM ≥ ×5': inset((a, c) => a.flower_plume() && a.setIn(...wantsErEm) && largerEq(a.getRolls(1)['em'], 5)),
		'ER[~s~] | EM ≥ ×3': inset((a, c) => a.affixIn('er') && a.setIn(...wantsErEm) && largerEq(a.getRolls(1)['em'], 3)),
		'EM[~sgc~] | ER ≥ ×3': inset((a, c) => a.affixIn('em') && a.setIn(...wantsErEm) && largerEq(a.getRolls(1)['er'], 3)),
		'CR[~c~] | ER+EM ≥ ×5': inset((a, c) => a.circlet() && a.setIn(...wantsErEm) && largerEq(add(...summax(a.getRolls(1), 'er', 'em')), 5)),

		'ER[~fp~] | ER ≥ ×5': inset((a, c) => a.flower_plume() && a.setIn(...sets.er) && largerEq(a.getRolls(1)['er'], 5)),
		'ER[~fp~] | ER+BD/EM ≥ ×7': inset((a, c) => a.flower_plume() && a.setIn(...sets.er) && largerEq(add(...summax(a.getRolls(1), 'er', ['bd', 'em'])), 7)),
		'ER[~s~] | BD/EM ≥ ×3': inset((a, c) => a.affixIn('er') && a.setIn(...sets.er) && largerEq(summax(a.getRolls(1), [], ['bd', 'em'])[1], 5)),
		'BD/EM/CR/HB[~sgc~] | ER ≥ ×4': inset((a, c) => a.affixIn('bd', 'em', 'cr', 'hb') && a.setIn(...sets.er) && largerEq(a.getRolls(1)['er'], 4)),
	}, {
		'OHC': new Ruleset({ bd: fraction(4, 3), er: fraction(6, 5), em: 1 }, { }), // roll(BD) = roll(EM) = roll(ER) = roll(CD) // FIXME Avoid double scaling. // TODO Test it.
		// 'DM' // FIXME MAX(BD) + EM + ER
		// 'FPL' // FIXME MAX(BD) + (EM > ER)
	});

	['MH', 'OC'].map(s => ruleset.setCoeff('cr', math.multiply(ruleset.getCoeff('bd', s), 2), s)); // coeff(CR) = coeff(BD) * 2
	['BS'].map(s => ruleset.setCoeff('cr', fraction(9, 8), s)); // roll(CR) = roll(BD)
	// ['BS'].map(s => ruleset.setCoeff('cr', 1, s)); // coeff(CR) = coeff(CD)
	['ESF', 'NO'].map(s => ruleset.setCoeff('er', ruleset.getCoeff('bd', s), s)); // coeff(ER) = coeff(BD)
	['VV', 'WT', 'TF', 'DM'].map(s => ruleset.setCoeff('em', ruleset.getCoeff('bd', s), s)); // coeff(EM) = coeff(BD)
	['CWF', 'GD', 'FPL'].map(s => ruleset.setCoeff('em', 1, s)); // coeff(EM) = coeff(CD)
	ruleset.setCoeff('hp', 0, ...sets.atk).setCoeff('def', 0, ...sets.atk)
		.setCoeff('hp', 0, ...sets.def).setCoeff('def', 0, ...sets.hp);

})();
