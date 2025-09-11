var ruleset, coeffsFor;
(() => {
	// Shortcuts.
	const avg = Artifact.average; // Do not compare Q with avg.* (avg.cd is the only exception).
	const [average] = [Artifact.dummy].map(f => _.bind(f, Artifact));
	const [quality, summax] = [Ruleset.quality, Ruleset.rollsSumMax].map(f => _.bind(f, Ruleset));
	const [fraction, round] = [math.fraction, math.round].map(f => _.bind(f, math));
	const [largerEq, add, max] = [formula.largerEq, formula.add, formula.max].map(f => _.bind(f, formula));

	// Database tweaks.
	let sets = _.cloneDeep(db.stats.sets);
	const elementalWide = ['NO', 'RB', 'TM', 'ESF', 'MH', 'GT', 'SHCC', 'OC'];
	sets.pyro.push('SR', 'FPL', 'VG', 'FHW', 'UR', 'LNO'); // Yoimiya / Hu Tao, Dehya, Arlecchino, Gaming, burgeon, burning.
	sets.hydro.push('OHC', 'FPL', 'SDP'); // Kokomi, Furina, Sigewinne, bloom.
	sets.electro.push('EO', 'FPL', 'FHW', 'LNO'); // Keqing, Clorinde, Varesa, hyperbloom.
	sets.anemo.push('WT', 'VH'); // Chasca, Xiao, Heizou.
	sets.dendro.push('WT', 'GD', 'FPL', 'UR'); // Tighnari, Nahida, bloom, burning.
	sets.pd.push('OHC'); // Qiqi.
	const usedByHealers = [...sets.hb, 'NO', 'VV', 'DM', 'SHCC'];
	const likesEM = ['NO', 'VV', 'RB', 'TS', 'TF', 'LW', 'CWF', 'HD', 'SR', 'ESF', 'EO', 'DM', 'ND', 'VG', 'MH', 'GT', 'FHW', 'UR', 'SHCC', 'OC', 'LNO', 'SMS'];
	const baseCoeff = fraction(3, 4), coeffsBySet = [ // Lower conditions have higher priority.
		[{ cd: 1, cr: 2, bd: baseCoeff, er: math.divide(baseCoeff, 2), em: math.divide(math.pow(baseCoeff, 2), 2) }], // roll(ER) = rolls(EM) = roll(BD)/2
		[...sets.atk, { def: 0, hp: 0 }],
		[...sets.def, { hp: 0 }],
		[...sets.hp, { def: 0 }],
		[...likesEM, { em: math.pow(baseCoeff, 2) }], // roll(EM) = roll(BD)
		['HOD', { atk: math.divide(baseCoeff, 2) }], // roll(ATK) = roll(DEF) / 2
		['VG', { hp: math.divide(baseCoeff, 2) }], // Dehya: roll(HP) = roll(ATK) / 2
		['MH', 'OC', 'NSU', { cr: math.multiply(baseCoeff, 2) }], // coeff(CR) = coeff(BD) * 2
		['BS', { cr: math.multiply(math.pow(baseCoeff, 2), 2) }], // roll(CR) = roll(BD)
		['NO', 'ESF', 'SMS', { er: baseCoeff }], // coeff(ER) = coeff(BD)
		['GF', 'BC', 'MB', 'AP', 'BS', 'TM', 'PF', 'HOD', 'VH', 'DPC', 'SDP', 'NWEW', 'FDG', { em: math.divide(math.pow(baseCoeff, 2), 2) }], // roll(EM) = roll(BD) / 2
		['WT', 'DM', 'GD', 'SR', 'OC', 'NSU', 'SMS', { em: baseCoeff }], // coeff(EM) = coeff(BD)
		['CWF', 'FPL', 'ND', { em: 1 }], // coeff(EM) = coeff(CD)
		// ['OHC', { bd: fraction(4, 3), er: fraction(6, 5), em: 1 }] // roll(BD) = roll(EM) = roll(ER) = roll(CD)
		['OHC', { bd: 1, er: 1, em: baseCoeff }], // roll(BD) = roll(EM) = roll(ER) = 3/4 roll(CD)
	];

	// Language extensions.
	const rule = (fn, dd) => (a, c) => {
		if(Ruleset.disabledIn(c, a.affix)) return false;
		if(dd === undefined || (_.isArray(dd) && dd.length))
			c = Ruleset.dedouble(a, c, ...(dd === undefined ? [] : dd));
		return fn(a, c);
	}
	const rules = (list) => new Ruleset(null, list);
	const coeffsBy = (set) => _.assign({ }, ...coeffsBySet.map(cond => cond.length == 1 || cond.includes(set) ? _.last(cond) : { }));
	const qMin = (r, p) => Ruleset.quality(average(r), coeffsBy(), p);
	const qFormula = (a, c, p) => formula.quality(a, c, p);
	const matchSetBonus = (a) =>
		(a.affixIn('atk') && a.setIn(...sets.atk)) ||
		(a.affixIn('def') && a.setIn(...sets.def)) ||
		(a.affixIn('hp') && a.setIn(...sets.hp)) ||
		(a.affixIn('er') && a.setIn(...sets.er)) ||
		(a.affixIn('em') && a.setIn(...sets.em)) ||
		(a.affixIn('ed') && a.setIn(...(sets[a.affix] || []), ...elementalWide)) || // Using extended elemental goblet list.
		(a.affixIn('pd') && a.setIn(...(sets['pd'] || []))) || // Using extended elemental goblet list.
		(a.affixIn('cr') && a.setIn(...sets.cr)) ||
		(a.affixIn('hb') && a.setIn(...usedByHealers)); // Using extended healing bonus list.

	const utility = (affix, i = +0) => { const AFFIX = _.upperCase(affix); return {
		[`⚙️ ${AFFIX}[~fp~] | ${AFFIX}/ER/CR ≥ ×${5+i}`]: rule((a, c) => a.flower_plume() && largerEq(summax(a, [], [affix, 'er', 'cr'])[1], 5+i)),
		[`⚙️ ${AFFIX}[~fp~] | ${AFFIX}+ER ≥ ×${6+i}`]: rule((a, c) => a.flower_plume() && largerEq(summax(a, [affix, 'er'], [])[0], 6+i)),
		[`⚙️ ${AFFIX}[~fp~] | ${AFFIX}+CR ≥ ×${6+i}`]: rule((a, c) => a.flower_plume() && largerEq(summax(a, [affix, 'cr'], [])[0], 6+i)),
		[`⚙️ ${AFFIX}[~fp~] | ${AFFIX}+ER+CR ≥ ×${7+i}`]: rule((a, c) => a.flower_plume() && largerEq(summax(a, [affix, 'er', 'cr'], [])[0], 7+i)),
		[`⚙️ ER/CR[~sc~] | ${AFFIX}/ER/CR ≥ ×${3+i}`]: rule((a, c) => a.affixIn('er', 'cr') && largerEq(summax(a, [], [affix, 'er', 'cr'])[1], 3+i)),
		[`⚙️ ER/CR[~sc~] | ${AFFIX}+ER+CR ≥ ×${5+i}`]: rule((a, c) => a.affixIn('er', 'cr') && largerEq(summax(a, [affix, 'er', 'cr'], [])[0], 5+i)),
		[`⚙️ ${AFFIX}[~sgc~] | ER ≥ ×${3+i}`]: rule((a, c) => a.affixIn(affix) && largerEq(summax(a, [], ['er'])[1], 3+i)),
		[`⚙️ ${AFFIX}[~sgc~] | CR ≥ ×${4+i}`]: rule((a, c) => a.affixIn(affix) && largerEq(summax(a, [], ['cr'])[1], 4+i)),
		[`⚙️ ${AFFIX}[~sgc~] | ER+CR ≥ ×${5+i}`]: rule((a, c) => a.affixIn(affix) && largerEq(summax(a, ['er', 'cr'], [])[0], 5+i)),
	}};

	ruleset = new Ruleset(coeffsBy(), {
		'⚙️ ER ≥ 30% (off-set)': rule((a, c) => a.er >= 30), // Mostly for Mona.
		'⚙️ ER+CR ≥ ×7 (off-set)': rule((a, c) => largerEq(summax(a, ['er', 'cr'], [])[0], 7)), // Mostly for Rosaria.
		'⚔︎ EM[~sgc~] | Q ≥ 33 (off-set)': rule((a, c) => a.affixIn('em') && largerEq(round(quality(a, c)), round(avg.cd * 5))),

		'⚔︎ Q[~fp~] ≥ 45 (off-set)': rule((a, c) => a.flower_plume() && largerEq(round(quality(a, c)), round(avg.cd * 7 - 1))),

		'⚔︎ BD[~s~] | Q ≥ 40 (off-set)': rule((a, c) => a.sands() && a.affixIn('bd') && largerEq(round(quality(a, c)), round(avg.cd * 6))),
		'⚔︎ ER[~s~] | Q ≥ 33 (off-set)': rule((a, c) => a.affixIn('er') && largerEq(round(quality(a, c)), round(avg.cd * 5))),

		'⚔︎ ED[~g~] | Q ≥ 31 (off-set)': rule((a, c) => a.goblet() && a.affixIn('ed') && largerEq(round(quality(a, c)), 31)),
		'⚔︎ BD[~g~] | Q ≥ 35 (off-set)': rule((a, c) => a.goblet() && a.affixIn('bd') && largerEq(round(quality(a, c)), 35)),
		'⚔︎ PD[~g~] | Q ≥ 40 (off-set)': rule((a, c) => a.goblet() && a.affixIn('pd') && largerEq(round(quality(a, c)), 40)),

		'⚔︎ CV[~c~] | Q ≥ 25 (off-set)': rule((a, c) => a.affixIn('cd', 'cr') && largerEq(round(quality(a, c)), round(avg.cd * 4 - 1))),
		'⚔︎ BD[~c~] | Q ≥ 45 (off-set)': rule((a, c) => a.circlet() && a.affixIn('bd') && largerEq(round(quality(a, c)), round(avg.cd * 7 - 1))),
		'⚕️ HB[~c~] | CV/BD/ER/EM ≥ ×5 (off-set)': rule((a, c) => a.affixIn('hb') && largerEq(summax(a, [], [], true)[1], 5)),
		'⚕️ HB[~c~] | ER+CV/BD/EM ≥ ×6 (off-set)': rule((a, c) => a.affixIn('hb') && largerEq(add(...summax(a, 'er', [], true)), 6)),
		'⚕️ HB[~c~] | CR+BD/EM ≥ ×6 (off-set)': rule((a, c) => a.affixIn('hb') && largerEq(add(...summax(a, 'cr', ['bd', 'em'])), 6)),
	}, [
		new Ruleset((a) => coeffsBy(a.set), { // Set dependant category.
			'⚔︎ Q[~fp~] ≥ 37': rule((a, c) => a.flower_plume() && largerEq(quality(a, c, 1), qMin({atk: 3, cd: 4}, 1))), // Qmin = 3BD+4CD.

			'⚔︎ ATK[~s~] | Q ≥ 26': rule((a, c) => a.sands() && a.affixIn('atk') && largerEq(round(quality(a, c)), round(avg.cd * 4))),
			'⚔︎ HP&DEF[~s~] | Q ≥ 33': rule((a, c) => a.sands() && a.affixIn('hp', 'def') && largerEq(round(quality(a, c)), round(avg.cd * 5))),
			'⚔︎ ER[~s~] | Q ≥ 24': rule((a, c) => a.affixIn('er') && largerEq(quality(a, c, 1), qMin({atk: 3, cd: 2}, 1))), // Qmin = 3BD+2CD.

			'⚔︎ BD[~g~] | Q ≥ 30': rule((a, c) => a.goblet() && a.affixIn('bd') && largerEq(round(quality(a, c)), 30)),

			'⚔︎ CV[~c~] | Q ≥ 20': rule((a, c) => a.affixIn('cd', 'cr') && largerEq(round(quality(a, c)), round(avg.cd * 3))),
			'⚔︎ BD[~c~] | Q ≥ 40': rule((a, c) => a.circlet() && a.affixIn('bd') && largerEq(round(quality(a, c)), round(avg.cd * 6))),
		}, [
			(a) => matchSetBonus(a) && rules({ // In-set goblets & helmets.
				'⚔︎ ED[~g~] | Q ≥ 25': rule((a, c) => a.goblet() && a.affixIn('ed') && largerEq(round(quality(a, c)), 25)),
				'⚔︎ PD[~g~] | Q ≥ 30': rule((a, c) => a.goblet() && a.affixIn('pd') && largerEq(round(quality(a, c)), 30)),

				'⚕️ HB[~c~] | ER+CV/BD/EM ≥ ×3': rule((a, c) => a.affixIn('hb') && largerEq(add(...summax(a, 'er', [], true)), 3)),
				'⚕️ HB[~c~] | CR+BD/EM ≥ ×3': rule((a, c) => a.affixIn('hb') && largerEq(add(...summax(a, 'cr', ['bd', 'em'])), 3)),
			}),
			(a) => a.setIn(...sets.cr) && rules({ // Sets with CR bonus.
				'⚔︎ Q[~fp~] ≥ 33 (CR-set)': rule((a, c) => a.flower_plume() && largerEq(round(quality(a, c)), round(avg.cd * 5)), false),
				'⚔︎ BD/EM[~sgc~] | Q ≥ 19 (CR-set)': rule((a, c) => a.affixIn('bd', 'em') && largerEq(quality(a, c, 0), quality(average({ cr: 5 }), c, 0)), false),
				'⚔︎ ED[~g~] | Q ≥ 19 (CR-set)': rule((a, c) => a.affixIn('ed') && matchSetBonus(a) && largerEq(quality(a, c, 0), quality(average({ atk: 5 }), c, 0)), false),
				'⚔︎ CD[~c~] | Q ≥ 15 (CR-set)': rule((a, c) => a.affixIn('cd') && largerEq(round(quality(a, c)), round(quality(average({ atk: 4 }), c))), false),
			}),
			(a) => a.setIn(...sets.def, 'NO', 'AP', 'OHC', 'SDP', 'SHCC') && rules({ // Sets with lower DEF% requirements (for sands).
				'⚔︎ DEF[~s~] | Q ≥ 26': rule((a, c) => a.sands() && a.affixIn('def') && largerEq(round(quality(a, c)), round(avg.cd * 4))),
			}),
			(a) => a.setIn(...sets.hp, 'NO', 'HD', 'TM', 'OHC', 'VG', 'SDP', 'SHCC') && rules({ // Sets with lower HP% requirements (for sands).
				'⚔︎ HP[~s~] | Q ≥ 26': rule((a, c) => a.sands() && a.affixIn('hp') && largerEq(round(quality(a, c)), round(avg.cd * 4))),
			}),
			(a) => a.setIn(...sets.em, ...likesEM, 'OHC', 'SDP') && rules({ // Sets with lower EM requirements (for sands).
				'⚔︎ EM[~s~] | Q ≥ 26': rule((a, c) => a.sands() && a.affixIn('em') && largerEq(round(quality(a, c)), round(avg.cd * 4))),
			}),
			(a) => a.setIn(...sets.atk) && rules(utility('atk', +1)), // Sets with ATK bonus that wants ER% & ATK% utility parts.
			(a) => a.setIn('MB', 'VV', 'AP', 'OHC', 'SDP') && rules(utility('atk')), // Sets that wants ER% & ATK% utility parts.
			(a) => a.setIn(...sets.def, 'MB', 'VV', 'AP', 'OHC', 'SDP') && rules(utility('def')), // Sets that wants ER% & DEF% utility parts.
			(a) => a.setIn(...sets.hp, 'MB', 'VV', 'AP', 'OHC', 'SDP') && rules(utility('hp')), // Sets that wants ER% & HP% utility parts.
			(a) => a.setIn(...sets.em, 'MB', 'VV', 'OHC', 'SDP') && rules(utility('em')), // Sets that wants ER% & EM utility parts.
			(a) => a.setIn(...sets.er, 'NO', 'SHCC') && rules({ // Sets with full utility rules (for all stats).
				'⚙️ ER[~fp~] | ER/BD/EM/CR ≥ ×5': rule((a, c) => a.flower_plume() && largerEq(summax(a, [], ['er', 'bd', 'em', 'cr'])[1], 5)),
				'⚙️ ER[~fp~] | ER+(BD/EM/CR) ≥ ×6': rule((a, c) => a.flower_plume() && largerEq(add(...summax(a, 'er', ['bd', 'em', 'cr'])), 6)),
				'⚙️ ER[~fp~] | CR+(BD/EM) ≥ ×6': rule((a, c) => a.flower_plume() && largerEq(add(...summax(a, 'cr', ['bd', 'em'])), 6)),
				'⚙️ ER[~fp~] | ER+CR+(BD/EM) ≥ ×7': rule((a, c) => a.flower_plume() && largerEq(add(...summax(a, ['er', 'cr'], ['bd', 'em'])), 7)),
				'⚙️ ER/CR[~sc~] | ER/BD/EM/CR ≥ ×4': rule((a, c) => a.affixIn('er', 'cr') && largerEq(summax(a, [], ['er', 'bd', 'em', 'cr'])[1], 4)),
				'⚙️ BD/EM[~sgc~] | ER/CR ≥ ×4': rule((a, c) => a.affixIn('bd', 'em') && largerEq(summax(a, [], ['er', 'cr'])[1], 4)),
				'⚙️ ER/CR[~sgc~] | ER+CR+(BD/EM) ≥ ×5': rule((a, c) => a.affixIn('er', 'cr') && largerEq(add(...summax(a, ['er', 'cr'], ['bd', 'em'])), 5)),
				'⚙️ EM[~sgc~] | ER+CR ≥ ×5': rule((a, c) => a.affixIn('bd', 'em') && largerEq(summax(a, ['er', 'cr'], [])[0], 5)),
				'⚙️ BD[~sgc~] | ER+CR ≥ ×6': rule((a, c) => a.affixIn('bd', 'em') && largerEq(summax(a, ['er', 'cr'], [])[0], 6)),
				'⚕️ HB[~c~] | ER/BD/EM/CR ≥ ×4': rule((a, c) => a.affixIn('hb') && largerEq(summax(a, [], ['er', 'bd', 'em', 'cr'])[1], 4)),
				'⚕️ HB[~c~] | ER+(BD/EM/CR) ≥ ×5': rule((a, c) => a.affixIn('hb') && largerEq(add(...summax(a, 'er', ['bd', 'em', 'cr'])), 5)),
				'⚕️ HB[~c~] | CR+(BD/EM) ≥ ×5': rule((a, c) => a.affixIn('hb') && largerEq(add(...summax(a, 'cr', ['bd', 'em'])), 5)),
				'⚕️ HB[~c~] | ER+CR+(BD/EM) ≥ ×6': rule((a, c) => a.affixIn('hb') && largerEq(add(...summax(a, ['er', 'cr'], ['bd', 'em'])), 6)),
			}),
			(a) => a.setIn('NO', 'SHCC') && rules({
				'⚙️ ER/CR[~sc~] | ER/BD/EM/CR ≥ ×4': () => false, // FIXME ?
				'⚙️ ER/CR[~sc~] | ER/BD/EM/CR ≥ ×3': rule((a, c) => a.affixIn('er', 'cr') && largerEq(summax(a, [], ['er', 'bd', 'em', 'cr'])[1], 3)),
				'⚙️ BD/EM[~sgc~] | ER/CR ≥ ×4': () => false, // FIXME ?
				'⚙️ BD/EM[~sgc~] | ER/CR ≥ ×3': rule((a, c) => a.affixIn('bd', 'em') && largerEq(summax(a, [], ['er', 'cr'])[1], 3)),
			}),
			(a) => a.setIn('DM', 'FPL', 'SMS') && rules({ // Sets with full utility rules (when ER = BD).
				'⚙️ EM&BD[~fp~] | (EM+BD)/ER/CR ≥ ×5': rule((a, c) => a.flower_plume() && largerEq(max(...summax(a, ['em', 'bd'], ['er', 'cr'])), 5)),
				'⚙️ EM&BD[~fp~] | (EM+BD)+ER/CR ≥ ×6': rule((a, c) => a.flower_plume() && largerEq(add(...summax(a, ['em', 'bd'], ['er', 'cr'])), 6)),
				'⚙️ EM&BD[~fp~] | ER+CR ≥ ×6': rule((a, c) => a.flower_plume() && largerEq(summax(a, ['er', 'cr'], [])[0], 6)),
				'⚙️ EM&BD[~fp~] | (EM+BD)+ER+CR ≥ ×7': rule((a, c) => a.flower_plume() && largerEq(summax(a, ['em', 'bd', 'er', 'cr'], [])[0], 7)),
				'⚙️ EM&BD/ER/CR/HB[~sgc~] | (EM+BD)/ER/CR ≥ ×3': rule((a, c) => a.affixIn('em', 'bd', 'er', 'cr', 'hb') && largerEq(max(...summax(a, ['em', 'bd'], ['er', 'cr'])), 3)),
				'⚙️ EM&BD/ER/CR/HB[~sgc~] | (EM+BD)+ER/CR ≥ 5': rule((a, c) => a.affixIn('em', 'bd', 'er', 'cr', 'hb') && largerEq(add(...summax(a, ['em', 'bd'], ['er', 'cr'])), 5)),
				'⚙️ EM&BD/HB[~sgc~] | ER+CR ≥ 4': rule((a, c) => a.affixIn('em', 'bd', 'hb') && largerEq(summax(a, ['er', 'cr'], [])[0], 4)),
				'⚙️ EM&BD/HB[~sgc~] | (EM+BD)+ER+CR ≥ 6': rule((a, c) => a.affixIn('em', 'bd', 'hb') && largerEq(summax(a, ['em', 'bd', 'er', 'cr'], [])[0], 6)),
			}),

			// TODO new Ruleset(), // Lauma: [NSU/SMS>DM/GD] EM > ER > CV & ED
			// TODO new Ruleset(), // Lauma: [NSU>DM/GD] CV & ED & EM > 800 ER
			// TODO new Ruleset(), // Furina: [GT] CV > HP > ED & ER
			// TODO new Ruleset(), // Nilou: [FPL > GD/2HP/2EM] HP > EM > ER
			// TODO new Ruleset(), // Kokomi: [OHC/GD/FPL/TM/SHCC/2EM/2ED/2HP] HB & ED > HP > ER
			// TODO new Ruleset(), // Mualani: [OC] CV & ED > EM & HP
			// Sayu/Tighnari/Nahida/Cyno/Sethos: CV & ED > EM > ATK
			// Albedo/Noelle/Itto/Chiori: CV & ED > DEF > ATK
			// Layla/Kirara: CV & ED > HP & ATK
			// Sigewinne: [SDP > NO/TM/ESF/OHC/2HP/2ER/2ED] CV & ED > HP > ER
			// Dehya: CV & ED > ATK > HP
			// Hu Tao: CV & ED > EM > HP > ATK
			// Xinyan: CV & ED > ATK > DEF
			// Chasca: CV > ATK > EM
			// Sucrose: EM > ER > CV & ATK
			// Zhongli: CV & ED > HP & ATK & ER
			// Rosaria: CR > ER > CD & ED & ATK
			// Ifa: EM > CV > ER & ATK
			// Baizhu: HP > ER > EM
		]),
	]);
	coeffsFor = (a) => coeffsBy(a?.set); // TODO Wrap with dedouble function.
})();
