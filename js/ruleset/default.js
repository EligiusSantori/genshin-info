var ruleset;
(() => {
	// Database tweaks.
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
	const lameDefSands = [...sets.def, 'NO', 'AP', 'SHCC'];
	const lameHpSands = [...sets.hp, 'NO', 'HD', 'TM', 'VG', 'SHCC'];
	const lameEmSands = [...sets.em, 'NO', 'SHCC'];

	// Shortcuts.
	const [avg, average, summax] = [Artifact.average, Ruleset.average, Ruleset.rollsSumMax]; // Do not compare Q with avg.* (avg.cd is the only exception).
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
	const utility = (affix, wants, i = +0) => { const AFFIX = _.upperCase(affix); return {
		[`${AFFIX}[~fp~] | ${AFFIX}/ER/CR ≥ ×${5+i}`]: inset((a, c) => a.flower_plume() && a.setIn(...wants) && largerEq(summax(a, [], [affix, 'er', 'cr'], false)[1], 5+i)),
		[`${AFFIX}[~fp~] | ${AFFIX}+ER ≥ ×${6+i}`]: inset((a, c) => a.flower_plume() && a.setIn(...wants) && largerEq(summax(a, [affix, 'er'], [], false)[0], 6+i)),
		[`${AFFIX}[~fp~] | ${AFFIX}+CR ≥ ×${6+i}`]: inset((a, c) => a.flower_plume() && a.setIn(...wants) && largerEq(summax(a, [affix, 'cr'], [], false)[0], 6+i)),
		[`${AFFIX}[~fp~] | ${AFFIX}+ER+CR ≥ ×${7+i}`]: inset((a, c) => a.flower_plume() && a.setIn(...wants) && largerEq(summax(a, [affix, 'er', 'cr'], [], false)[0], 7+i)),
		[`ER[~s~] | ${AFFIX}/CR ≥ ×${3+i}`]: inset((a, c) => a.affixIn('er') && a.setIn(...wants) && largerEq(summax(a, [], [affix, 'cr'], false)[1], 3+i)),
		[`ER[~s~] | ${AFFIX}+CR ≥ ×${5+i}`]: inset((a, c) => a.affixIn('er') && a.setIn(...wants) && largerEq(summax(a, [affix, 'cr'], [], false)[0], 5+i)),
		[`${AFFIX}[~sgc~] | ER/CR ≥ ×${3+i}`]: inset((a, c) => a.affixIn(affix) && a.setIn(...wants) && largerEq(summax(a, [], ['er', 'cr'], false)[1], 3+i)),
		[`${AFFIX}[~sgc~] | ER+CR ≥ ×${5+i}`]: inset((a, c) => a.affixIn(affix) && a.setIn(...wants) && largerEq(summax(a, ['er', 'cr'], [], false)[0], 5+i)),
		[`CR[~c~] | ${AFFIX}/ER ≥ ×${3+i}`]: inset((a, c) => a.affixIn('cr') && a.setIn(...wants) && largerEq(summax(a, [], [affix, 'er'], false)[1], 3+i)),
		[`CR[~c~] | ${AFFIX}+ER ≥ ×${5+i}`]: inset((a, c) => a.affixIn('cr') && a.setIn(...wants) && largerEq(summax(a, [affix, 'er'], [], false)[0], 5+i)),
	}};

	ruleset = new Ruleset({ cd: 1, cr: 2, bd: fraction(3, 4), er: fraction(1, 3), em: fraction(9, 16) }, { // roll(EM) = roll(BD)

		// Slotless rules.
		'ER ≥ 30% (off-set)': offset((a, c) => a.er >= 30),
		'EM ≥ 119 (off-set)': offset((a, c) => round(a.em) >= round(avg.em * 6)),
		'EM[~sgc~] | Q ≥ 33 (off-set)': offset((a, c) => a.affixIn('em') && largerEq(round(quality(a, c)), round(avg.cd * 5))),

		// Setless flower & plume rules.
		'Q[~fp~] ≥ 45 (off-set)': offset((a, c) => a.flower_plume() && largerEq(round(quality(a, c)), round(avg.cd * 7 - 1))),
		'Q[~fp~] ≥ 37': inset((a, c) => a.flower_plume() && largerEq(quality(a, c, 1), qMin({atk: 3, cd: 4}, 1))), // Qmin = 3BD+4CD.

		// Setless sands rules.
		'BD[~s~] | Q ≥ 40 (off-set)': offset((a, c) => a.sands() && a.affixIn('bd') && largerEq(round(quality(a, c)), round(avg.cd * 6))),
		'ATK[~s~] | Q ≥ 26': inset((a, c) => a.sands() && a.affixIn('atk') && largerEq(round(quality(a, c)), round(avg.cd * 4))),
		'HP&DEF[~s~] | Q ≥ 33': inset((a, c) => a.sands() && a.affixIn('hp', 'def') && largerEq(round(quality(a, c)), round(avg.cd * 5))),
		'ER[~s~] | Q ≥ 33 (off-set)': offset((a, c) => a.affixIn('er') && largerEq(round(quality(a, c)), round(avg.cd * 5))),
		'ER[~s~] | Q ≥ 24': inset((a, c) => a.affixIn('er') && largerEq(quality(a, c, 1), qMin({atk: 3, cd: 2}, 1))), // Qmin = 3BD+2CD.

		// Setless goblet rules.
		'ED[~g~] | Q ≥ 30 (off-set)': offset((a, c) => a.goblet() && a.affixIn('ed') && largerEq(round(quality(a, c)), 30)),
		'ED[~g~] | Q ≥ 25': inset((a, c) => a.goblet() && a.affixIn('ed') && largerEq(round(quality(a, c)), 25), true),
		'BD[~g~] | Q ≥ 35 (off-set)': offset((a, c) => a.goblet() && a.affixIn('bd') && largerEq(round(quality(a, c)), 35)),
		'BD[~g~] | Q ≥ 30': inset((a, c) => a.goblet() && a.affixIn('bd') && largerEq(round(quality(a, c)), 30), true),
		'PD[~g~] | Q ≥ 35 (off-set)': offset((a, c) => a.goblet() && a.affixIn('pd') && largerEq(round(quality(a, c)), 35)),
		'PD[~g~] | Q ≥ 30': inset((a, c) => a.goblet() && a.affixIn('pd') && largerEq(round(quality(a, c)), 30), true),

		// Setless circlet rules.
		'CV[~c~] | Q ≥ 25 (off-set)': offset((a, c) => a.affixIn('cd', 'cr') && largerEq(round(quality(a, c)), round(avg.cd * 4 - 1))),
		'CV[~c~] | Q ≥ 20': inset((a, c) => a.affixIn('cd', 'cr') && largerEq(round(quality(a, c)), round(avg.cd * 3))),
		'BD[~c~] | Q ≥ 45 (off-set)': offset((a, c) => a.circlet() && a.affixIn('bd') && largerEq(round(quality(a, c)), round(avg.cd * 7 - 1))),
		'BD[~c~] | Q ≥ 40': inset((a, c) => a.circlet() && a.affixIn('bd') && largerEq(round(quality(a, c)), round(avg.cd * 6))),
		'HB[~c~] | CV/BD/ER/EM ≥ ×5 (off-set)': offset((a, c) => a.affixIn('hb') && largerEq(summax(a)[1], 5)),
		'HB[~c~] | ER+CV/BD/ER/EM ≥ ×6 (off-set)': offset((a, c) => a.affixIn('hb') && largerEq(add(...summax(a, 'er')), 6)),
		'HB[~c~] | ER+CV/BD/ER/EM ≥ ×3': inset((a, c) => a.affixIn('hb') && largerEq(add(...summax(a, 'er')), 3), true),

		// Multiset combat rules.
		'DEF[~s~] | Q ≥ 26': inset((a, c) => a.sands() && a.affixIn('def') && a.setIn(...lameDefSands) && largerEq(round(quality(a, c)), round(avg.cd * 4))),
		'HP[~s~] | Q ≥ 26': inset((a, c) => a.sands() && a.affixIn('hp') && a.setIn(...lameHpSands) && largerEq(round(quality(a, c)), round(avg.cd * 4))),
		'EM[~s~] | Q ≥ 26': inset((a, c) => a.sands() && a.affixIn('em') && a.setIn(...lameEmSands) && largerEq(round(quality(a, c)), round(avg.cd * 4))),

		'Q[~fp~] ≥ 33 (CR-set)': inset((a, c) => a.flower_plume() && a.setIn(...sets.cr) && largerEq(round(quality(a, c)), round(avg.cd * 5))),
		'BD[~sgc~] | Q ≥ 19 (CR-set)': inset((a, c) => a.affixIn('bd') && a.setIn(...sets.cr) && largerEq(quality(a, c, 0), quality(average({ cr: 5 }), c, 0))),
		'ED[~g~] | Q ≥ 19 (CR-set)': inset((a, c) => a.affixIn('ed') && a.setIn(...sets.cr) && largerEq(quality(a, c, 0), quality(average({ atk: 5 }), c, 0)), true),
		'CV[~c~] | Q ≥ 15 (CR-set)': inset((a, c) => a.affixIn('cd') && a.setIn(...sets.cr) && largerEq(round(quality(a, c)), round(quality(average({ atk: 4 }), c)))),

		// Multiset utility rules.
		...utility('atk', wantsErAtk, +1),
		...utility('def', wantsErDef),
		...utility('hp', wantsErHp),
		...utility('em', wantsErEm),

		'ER[~fp~] | ER ≥ ×5': inset((a, c) => a.flower_plume() && a.setIn(...sets.er) && largerEq(round(a.er), round(avg.er * 5))),
		'ER[~fp~] | ER+BD/EM ≥ ×7': inset((a, c) => a.flower_plume() && a.setIn(...sets.er) && largerEq(add(...summax(a, 'er', ['bd', 'em'])), 7)),
		'ER[~s~] | BD/EM ≥ ×3': inset((a, c) => a.affixIn('er') && a.setIn(...sets.er) && largerEq(summax(a, [], ['bd', 'em'])[1], 5)),
		'BD/EM/CR/HB[~sgc~] | ER ≥ ×4': inset((a, c) => a.affixIn('bd', 'em', 'cr', 'hb') && a.setIn(...sets.er) && largerEq(round(a.er), round(avg.er * 4))),
	}, {
		'OHC': new Ruleset({ bd: fraction(4, 3), er: fraction(6, 5), em: 1 }, { }), // roll(BD) = roll(EM) = roll(ER) = roll(CD) // FIXME Avoid double scaling. // TODO Test it.
		// TODO 'DM': new Ruleset({ }, { }), // FIXME utility MAX(BD) + EM + ER
		// TODO 'FPL': new Ruleset({ }, { }), // FIXME utility MAX(BD) + (EM > ER)
	});

	// Coefficient tweaks.
	['MH', 'OC'].map(s => ruleset.setCoeff('cr', math.multiply(ruleset.getCoeff('bd', s), 2), s)); // coeff(CR) = coeff(BD) * 2
	['BS'].map(s => ruleset.setCoeff('cr', fraction(9, 8), s)); // roll(CR) = roll(BD)

	['CWF', 'FPL', 'ND'].map(s => ruleset.setCoeff('em', 1, s)); // coeff(EM) = coeff(CD)
	['WT', 'DM', 'GD', 'SR', 'OC'].map(s => ruleset.setCoeff('em', ruleset.getCoeff('bd', s), s)); // coeff(EM) = coeff(BD)
	['GF', 'BC', 'MB', 'AP', 'BS', 'TM', 'PF', 'HOD', 'VH', 'SDP', 'NWEW', 'FDG'].map(s => ruleset.setCoeff('em', fraction(1, 3), s)); // roll(EM) ≈ roll(BD) / 2

	['ESF', 'NO'].map(s => ruleset.setCoeff('er', ruleset.getCoeff('bd', s), s)); // coeff(ER) = coeff(BD)

	ruleset.setCoeff('hp', 0, ...sets.atk).setCoeff('def', 0, ...sets.atk)
		.setCoeff('hp', 0, ...sets.def).setCoeff('def', 0, ...sets.hp);
})();
