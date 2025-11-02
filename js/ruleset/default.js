var ruleset, coeffsFor;
(() => {
	// Shortcuts.
	const [quality, summax] = [Ruleset.quality, Ruleset.rollsSumMax].map(f => _.bind(f, Ruleset));
	const [fraction, round] = [math.fraction, math.round].map(f => _.bind(f, math));
	const [largerEq, add, max] = [formula.largerEq, formula.add, formula.max].map(f => _.bind(f, formula));

	// Database tweaks.
	let sets = _.cloneDeep(db.stats.sets);
	const elementalWide = ['NO', 'RB', 'TM', 'ESF', 'MH', 'GT', 'SHCC', 'OC', 'LNO', 'NSU', 'SMS'];
	sets.pyro.push('SR', 'FPL', 'VG', 'FHW', 'UR'); // Yoimiya / Hu Tao, Dehya, Arlecchino, burgeon, burning.
	sets.hydro.push('OHC', 'FPL', 'SDP'); // Kokomi, Sigewinne, bloom.
	sets.electro.push('EO', 'FPL', 'FHW'); // Keqing, Clorinde, hyperbloom.
	sets.anemo.push('WT', 'VH'); // Chasca, Xiao, Heizou.
	sets.dendro.push('WT', 'GD', 'FPL', 'UR'); // Tighnari, Nahida, bloom, burning.
	sets.pd.push('OHC'); // Qiqi.
	const usedByHealers = [...sets.hb, 'NO', 'VV', 'DM', 'SHCC'];
	const likesEM = [...elementalWide, 'VV', 'TS', 'TF', 'LW', 'CWF', 'HD', 'SR', 'EO', 'DM', 'ND', 'VG', 'FHW', 'UR'];
	const baseCoeff = fraction(3, 4), coeffsBySet = [ // Tailing conditions have higher priority.
		[{ cd: 1, cr: 2, bd: 1, er: fraction(2, 4), em: fraction(1, 4) }],
		[...sets.atk, 'GD', { def: 0, hp: 0 }],
		[...sets.def, { hp: 0 }],
		[...sets.hp, { def: 0 }],
		[...likesEM, { em: fraction(2, 4) }],
		['HOD', { atk: math.multiply(math.divide(1, baseCoeff), fraction(2, 4)) }], // [Noelle] roll(ATK) = 1/2 roll(CD)
		['VG', { hp: math.multiply(math.divide(1, baseCoeff), fraction(2, 4)) }], // [Dehya] roll(HP) = 1/2 roll(CD)
		['BS'/*unfreezables*/, 'MH', 'OC', 'NSU', { cr: math.multiply(2, baseCoeff) }], // roll(CR) = roll(BD)
		[...sets.er, 'NO', 'MB', 'GT'/*Furina C4-*/, 'NSU'/* Flins&Lauma */, { er: baseCoeff }], // roll(ER) = roll(BD)
		['WT', 'SR', 'DM', 'GD', 'OC', { em: baseCoeff }], // roll(EM) = roll(BD) // FIXME ? GD:(50/19.5)/(14/4.95), ...?
		['CWF', 'FPL', 'ND'/*Tartaglia*/, { em: 1 }], // roll(EM) = roll(CD)
		['OHC', { bd: 1, er: baseCoeff, em: baseCoeff }], // roll(BD) = roll(EM) = roll(ER) = 3/4 roll(CD)
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
	const qFormula = (a, c, p) => formula.quality(a, c, p);
	const qLargerEq = (a, c, s, p) => largerEq(Ruleset.quality(a, c, p || 0), Ruleset.quality(Artifact.dummy(s), c, p || 0))
	const rSum = (a, stats) => summax(a, stats, [])[0];
	const rMax = (a, stats) => summax(a, [], stats)[1];
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
		[`⚙️ [${AFFIX}+] [~fp~] | ${AFFIX}/ER/CR ≥ ×${5+i}`]: rule((a, c) => a.flower_plume() && largerEq(rMax(a, [affix, 'er', 'cr']), 5+i)),
		[`⚙️ [${AFFIX}+] [~fp~] | ${AFFIX}+ER ≥ ×${6+i}`]: rule((a, c) => a.flower_plume() && largerEq(rSum(a, [affix, 'er']), 6+i)),
		[`⚙️ [${AFFIX}+] [~fp~] | ${AFFIX}+CR ≥ ×${6+i}`]: rule((a, c) => a.flower_plume() && largerEq(rSum(a, [affix, 'cr']), 6+i)),
		[`⚙️ [${AFFIX}+] [~fp~] | ${AFFIX}+ER+CR ≥ ×${7+i}`]: rule((a, c) => a.flower_plume() && largerEq(rSum(a, [affix, 'er', 'cr']), 7+i)),
		[`⚙️ [${AFFIX}+] ER/CR[~sc~] | ${AFFIX}/ER/CR ≥ ×${3+i}`]: rule((a, c) => a.affixIn('er', 'cr') && largerEq(rMax(a, [affix, 'er', 'cr']), 3+i)),
		[`⚙️ [${AFFIX}+] ER/CR[~sc~] | ${AFFIX}+ER+CR ≥ ×${5+i}`]: rule((a, c) => a.affixIn('er', 'cr') && largerEq(rSum(a, [affix, 'er', 'cr']), 5+i)),
		[`⚙️ [${AFFIX}+] [~sgc~] | ER ≥ ×${3+i}`]: rule((a, c) => a.affixIn(affix) && largerEq(rMax(a, ['er']), 3+i)),
		[`⚙️ [${AFFIX}+] [~sgc~] | CR ≥ ×${4+i}`]: rule((a, c) => a.affixIn(affix) && largerEq(rMax(a, ['cr']), 4+i)),
		[`⚙️ [${AFFIX}+] [~sgc~] | ER+CR ≥ ×${5+i}`]: rule((a, c) => a.affixIn(affix) && largerEq(rSum(a, ['er', 'cr']), 5+i)),
	}};

	ruleset = new Ruleset(coeffsBy(), {
		'⚙️ ER ≥ 30% (off-set)': rule((a, c) => a.er >= 30), // Mostly for Mona.
		'⚙️ ER+CR ≥ ×7 (off-set)': rule((a, c) => largerEq(rSum(a, ['er', 'cr']), 7)), // Mostly for Rosaria.
		'⚔︎ EM[~sgc~] | Q ≥ 5×CD (off-set)': rule((a, c) => a.affixIn('em') && qLargerEq(a, c, { cd: 5 })),

		'⚔︎ Q[~fp~] ≥ 7×CD (off-set)': rule((a, c) => a.flower_plume() && qLargerEq(a, c, { cd: 7 })),

		'⚔︎ BD[~s~] | Q ≥ 6×CD (off-set)': rule((a, c) => a.sands('bd') && qLargerEq(a, c, { cd: 6 })),
		'⚔︎ ER[~s~] | Q ≥ 5×CD (off-set)': rule((a, c) => a.sands('er') && qLargerEq(a, c, { cd: 5 })),

		'⚔︎ ED[~g~] | Q ≥ 5×CD (off-set)': rule((a, c) => a.goblet('ed') && qLargerEq(a, c, { cd: 5 })),
		'⚔︎ BD[~g~] | Q ≥ 6×CD (off-set)': rule((a, c) => a.goblet('bd') && qLargerEq(a, c, { cd: 6 })),
		'⚔︎ PD[~g~] | Q ≥ 6×CD (off-set)': rule((a, c) => a.goblet('pd') && qLargerEq(a, c, { cd: 6 })),

		'⚔︎ CV[~c~] | Q ≥ 4×CD (off-set)': rule((a, c) => a.circlet('cv') && qLargerEq(a, c, { cd: 4 })),
		'⚔︎ BD[~c~] | Q ≥ 7×CD (off-set)': rule((a, c) => a.circlet('bd') && qLargerEq(a, c, { cd: 7 })),
		'⚕️ HB[~c~] | BD/EM/ER/CV ≥ ×5 (off-set)': rule((a, c) => a.circlet('hb') && largerEq(summax(a, [], [], true)[1], 5)),
		'⚕️ HB[~c~] | ER+BD/EM/CV ≥ ×6 (off-set)': rule((a, c) => a.circlet('hb') && largerEq(add(...summax(a, 'er', [], true)), 6)),
		'⚕️ HB[~c~] | CR+BD/EM ≥ ×6 (off-set)': rule((a, c) => a.circlet('hb') && largerEq(add(...summax(a, 'cr', ['bd', 'em'])), 6)),
	}, [
		new Ruleset((a) => coeffsBy(a.set), { // Set dependant category.
			'⚔︎ Q[~fp~] ≥ 6×CD': rule((a, c) => a.flower_plume() && qLargerEq(a, c, { cd: 6 })),

			'⚔︎ ATK/ER[~s~] | Q ≥ 4×CD': rule((a, c) => a.sands('atk', 'er') && qLargerEq(a, c, { cd: 4 })),
			'⚔︎ HP&DEF[~s~] | Q ≥ 5×CD': rule((a, c) => a.sands('hp', 'def') && qLargerEq(a, c, { cd: 5 })),

			'⚔︎ BD[~g~] | Q ≥ 5×CD': rule((a, c) => a.goblet('bd') && qLargerEq(a, c, { cd: 5 })),

			'⚔︎ CV[~c~] | Q ≥ 3×CD': rule((a, c) => a.circlet('cv') && qLargerEq(a, c, { cd: 3 })),
			'⚔︎ BD[~c~] | Q ≥ 6×CD': rule((a, c) => a.circlet('bd') && qLargerEq(a, c, { cd: 6 })),
		}, [
			(a) => matchSetBonus(a) && rules({ // In-set goblets & helmets.
				'⚔︎ ED[~g~] | Q ≥ 4×CD': rule((a, c) => a.goblet('ed') && qLargerEq(a, c, { cd: 4 })),
				'⚔︎ PD[~g~] | Q ≥ 5×CD': rule((a, c) => a.goblet('pd') && qLargerEq(a, c, { cd: 5 })),

				'⚕️ HB[~c~] | ER+CV/BD/EM ≥ ×3': rule((a, c) => a.circlet('hb') && largerEq(add(...summax(a, 'er', [], true)), 3)),
				'⚕️ HB[~c~] | CR+BD/EM ≥ ×3': rule((a, c) => a.circlet('hb') && largerEq(add(...summax(a, 'cr', ['bd', 'em'])), 3)),
			}),
			(a) => a.setIn(...sets.cr) && rules({ // Sets with CR bonus.
				'⚔︎ [CR+] Q[~fp~] ≥ 5×CD': rule((a, c) => a.flower_plume() && qLargerEq(a, c, { cd: 5 }), false),
				'⚔︎ [CR+] BD/EM[~sg~] | Q ≥ 5×CR': rule((a, c) => !a.circlet() && a.affixIn('bd', 'em') && qLargerEq(a, c, { cr: 5 }), false),
				'⚔︎ [CR+] ED/CD[~gc~] | Q ≥ 4×CR': rule((a, c) => ((a.goblet('ed') && matchSetBonus(a)) || a.circlet('cd')) && qLargerEq(a, c, { cr: 4 }), false),
				'⚔︎ [CR+] BD/EM[~c~] | Q ≥ 6×CR': rule((a, c) => a.circlet('bd', 'em') && qLargerEq(a, c, { cr: 6 }), false),
			}),
			(a) => a.setIn(...sets.def, 'NO', 'AP', 'OHC', 'SDP', 'SHCC') && rules({ // Sets with lower DEF% requirements.
				'⚔︎ DEF[~s~] | Q ≥ 4×CD': rule((a, c) => a.sands('def') && qLargerEq(a, c, { cd: 4 })),
			}),
			(a) => a.setIn(...sets.hp, 'NO', 'HD', 'OHC', 'SDP', 'SHCC') && rules({ // Sets with lower HP% requirements.
				'⚔︎ HP[~s~] | Q ≥ 4×CD': rule((a, c) => a.sands('hp') && qLargerEq(a, c, { cd: 4 })),
			}),
			(a) => a.setIn(...sets.em, ...likesEM, 'OHC', 'SDP') && rules({ // Sets with lower EM requirements.
				'⚔︎ EM[~sg~] | Q ≥ 4×CD': rule((a, c) => !a.circlet() && a.affixIn('em') && qLargerEq(a, c, { cd: 4 })),
			}),

			(a) => a.setIn(...sets.atk) && rules(utility('atk', +1)), // Sets with ATK bonus that wants ER% & ATK% utility parts.
			(a) => a.setIn('MB', 'VV', 'AP', 'OHC', 'SDP') && rules(utility('atk')), // Sets that wants ER% & ATK% utility parts.
			(a) => a.setIn(...sets.def, 'MB', 'VV', 'AP', 'OHC', 'SDP') && rules(utility('def')), // Sets that wants ER% & DEF% utility parts.
			(a) => a.setIn(...sets.hp, 'MB', 'VV', 'AP', 'OHC', 'SDP') && rules(utility('hp')), // Sets that wants ER% & HP% utility parts.
			(a) => a.setIn('WT', 'NSU') && rules(utility('em', +1)), // Combat sets that wants ER% & EM utility parts.
			(a) => a.setIn('GD', 'FPL', 'MB', 'VV', 'OHC', 'SDP') && rules(utility('em')), // Sets that wants ER% & EM utility parts.

			(a) => a.setIn(...sets.er, 'NO', 'SHCC') && rules({ // Sets with full utility rules (for all stats).
				'⚙️ [ER+] [~fp~] | ER/BD/EM/CR ≥ ×5': rule((a, c) => a.flower_plume() && largerEq(rMax(a, ['er', 'bd', 'em', 'cr']), 5)),
				'⚙️ [ER+] [~fp~] | ER+(BD/EM) ≥ ×6': rule((a, c) => a.flower_plume() && largerEq(add(...summax(a, 'er', ['bd', 'em'])), 6)),
				'⚙️ [ER+] [~fp~] | CR+(ER/BD/EM) ≥ ×7': rule((a, c) => a.flower_plume() && largerEq(add(...summax(a, 'cr', ['er', 'bd', 'em'])), 7)),
				'⚙️ [ER+] [~fp~] | ER+CR+(BD/EM) ≥ ×8': rule((a, c) => a.flower_plume() && largerEq(add(...summax(a, ['er', 'cr'], ['bd', 'em'])), 8)),
				'⚙️ [ER+] EM[~sgc~] | ER/CR ≥ ×4': rule((a, c) => a.affixIn('em') && largerEq(rMax(a, ['er', 'cr']), 4)),
				'⚙️ [ER+] BD[~sgc~] | ER/CR ≥ ×5': rule((a, c) => a.affixIn('bd') && largerEq(rMax(a, ['er', 'cr']), 5)),
				'⚙️ [ER+] BD/EM[~sgc~] | ER+CR ≥ ×6': rule((a, c) => a.affixIn('bd', 'em') && largerEq(rSum(a, ['er', 'cr']), 6)),
				'⚙️ [ER+] ER/CR[~sc~] | ER/BD/EM/CR ≥ ×4': rule((a, c) => a.affixIn('er', 'cr') && largerEq(rMax(a, ['er', 'bd', 'em', 'cr']), 4)),
				'⚙️ [ER+] ER/CR[~sc~] | (ER/CR)+(BD/EM) ≥ ×5': rule((a, c) => a.affixIn('er', 'cr') && largerEq(add(...summax(a, ['er', 'cr'], ['bd', 'em'])), 5)),
				'⚕️ [ER+] HB[~c~] | ER/BD/EM/CR ≥ ×4': rule((a, c) => a.affixIn('hb') && largerEq(rMax(a, ['er', 'bd', 'em', 'cr']), 4)),
				'⚕️ [ER+] HB[~c~] | ER+(BD/EM/CR) ≥ ×5': rule((a, c) => a.affixIn('hb') && largerEq(add(...summax(a, 'er', ['bd', 'em', 'cr'])), 5)),
				'⚕️ [ER+] HB[~c~] | CR+(BD/EM) ≥ ×5': rule((a, c) => a.affixIn('hb') && largerEq(add(...summax(a, 'cr', ['bd', 'em'])), 5)),
				'⚕️ [ER+] HB[~c~] | ER+CR+(BD/EM) ≥ ×6': rule((a, c) => a.affixIn('hb') && largerEq(add(...summax(a, ['er', 'cr'], ['bd', 'em'])), 6)),
			}),
			(a) => a.setIn('NO', 'SHCC') && rules({
				'⚙️ [ER+] ER[~s~] | BD/EM ≥ ×3': rule((a, c) => a.affixIn('er') && largerEq(rMax(a, ['bd', 'em']), 3)),
				'⚙️ [ER+] BD/EM[~sgc~] | ER ≥ ×3': rule((a, c) => a.affixIn('bd', 'em') && largerEq(rMax(a, ['er']), 3)),
			}),
			(a) => a.setIn('DM', 'FPL', 'SMS') && rules({ // Sets with full utility rules (when EM = BD).
				'⚙️ [EM&BD] [~fp~] | ER/CR ≥ ×5': rule((a, c) => a.flower_plume() && largerEq(rMax(a, ['er', 'cr']), 5)),
				'⚙️ [EM&BD] [~fp~] | (EM+BD)/(ER+CR) ≥ ×6': rule((a, c) => a.flower_plume() && largerEq(max(rSum(a, ['em', 'bd']), rSum(a, ['er', 'cr'])), 6)),
				'⚙️ [EM&BD] [~fp~] | (EM+BD)+ER/CR ≥ ×7': rule((a, c) => a.flower_plume() && largerEq(add(...summax(a, ['em', 'bd'], ['er', 'cr'])), 7)),
				'⚙️ [EM&BD] [~fp~] | (EM/BD)+ER+CR ≥ ×7': rule((a, c) => a.flower_plume() && largerEq(add(...summax(a, ['er', 'cr'], ['em', 'bd'])), 7)),
				'⚙️ [EM&BD] [~fp~] | (EM+BD)+ER+CR ≥ ×8': rule((a, c) => a.flower_plume() && largerEq(rSum(a, ['em', 'bd', 'er', 'cr']), 8)),
				'⚙️ [EM&BD] BD[~sgc~] | EM/ER/CR ≥ ×5': rule((a, c) => a.affixIn('bd') && largerEq(rMax(a, ['em', 'er', 'cr']), 5)),
				'⚙️ [EM&BD] BD[~sgc~] | EM+ER ≥ 6': rule((a, c) => a.affixIn('bd') && largerEq(rSum(a, ['em', 'er']), 6)),
				'⚙️ [EM&BD] BD[~sgc~] | (EM/ER)+CR ≥ 6': rule((a, c) => a.affixIn('bd') && largerEq(add(...summax(a, ['cr'], ['em', 'er'])), 6)),
				'⚙️ [EM&BD] BD[~sgc~] | EM+ER+CR ≥ 7': rule((a, c) => a.affixIn('bd') && largerEq(rSum(a, ['em', 'er', 'cr']), 7)),
				'⚙️ [EM&BD] ER/EM/CR/HB[~sgc~] | (EM+BD)/ER/CR ≥ ×4': rule((a, c) => a.affixIn('er', 'em', 'cr', 'hb') && largerEq(max(...summax(a, ['em', 'bd'], ['er', 'cr'])), 4)),
				'⚙️ [EM&BD] ER/EM/CR/HB[~sgc~] | (EM+BD)+ER/CR ≥ 5': rule((a, c) => a.affixIn('er', 'em', 'cr', 'hb') && largerEq(add(...summax(a, ['em', 'bd'], ['er', 'cr'])), 5)),
				'⚙️ [EM&BD] EM/HB[~sgc~] | ER+CR ≥ 5': rule((a, c) => a.affixIn('em', 'hb') && largerEq(rSum(a, ['er', 'cr']), 5)),
				'⚙️ [EM&BD] EM/HB[~sgc~] | (EM+BD)+ER+CR ≥ 6': rule((a, c) => a.affixIn('em', 'hb') && largerEq(rSum(a, ['em', 'bd', 'er', 'cr']), 6)),
			}),

			// TODO new Ruleset(), // Lauma: [NSU>SMS>DM/GD] CD & CR{<60/90} > EM & ER{~200} // Max CV, uses EM instead of ATK.
			// TODO new Ruleset(), // Nilou: [FPL > GD/2HP/2EM] HP > EM > ER
			// TODO new Ruleset(), // Kokomi: [OHC/GD/FPL/TM/SHCC/2EM/2ED/2HP] HB & ED > HP > ER
			// TODO new Ruleset(), // Mualani: [OC] CV & ED > EM & HP
			// ?Gaming [LNO>CW] CV > EM & ER > ATK
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
