var ruleset, coeffsFor, groupsFor;
(() => {
	// Shortcuts.
	const [quality, summax] = [Ruleset.quality, Ruleset.rollsSumMax].map(f => _.bind(f, Ruleset));
	const [fraction, round] = [math.fraction, math.round].map(f => _.bind(f, math));
	const [largerEq, add, max] = [formula.largerEq, formula.add, formula.max].map(f => _.bind(f, formula));

	// Database tweaks.
	let sets = _.cloneDeep(db.stats.sets);
	const elementalWide = ['NO', 'RB', 'TM', 'ESF', 'MH', 'GT', 'SHCC', 'OC', 'LNO', 'DCRW'];
	sets.pyro.push('SR', 'FPL', 'VG', 'FHW', 'UR'); // Yoimiya / Hu Tao, Dehya, Arlecchino, burgeon, burning.
	sets.hydro.push('OHC', 'FPL', 'SDP'); // Kokomi, Sigewinne, bloom.
	sets.electro.push('EO', 'FPL', 'FHW'); // Keqing, Clorinde, hyperbloom.
	sets.anemo.push('WT', 'VH'); // Chasca, Xiao, Heizou.
	sets.dendro.push('WT', 'GD', 'FPL', 'UR'); // Tighnari, Nahida, bloom, burning.
	sets.pd.push('OHC'); // Qiqi.
	const usedByHealers = [...sets.hb, 'NO', 'VV', 'DM', 'SHCC'];
	const lovesDEF = [...sets.def, 'NO', 'MB', 'AP', 'OHC', 'MH', 'NSU', 'SMS', 'AMM'];
	const lovesHP = [...sets.hp, 'NO', 'MB', 'CWF', 'HD', 'ESF', 'OHC', 'FPL'/*?*/, 'MH', 'GT', 'SDP', 'OC', 'NSU', 'SMS', 'AMM'];
	const neglectsEM = ['BC', 'AP', 'BS', 'PF', 'HOD', 'NWEW', 'FDG'];
	const lovesEM = ['CWF', 'SR', 'DM', 'ND'/*Tartaglia*/, 'OC', 'SMS'];
	const mainsEM = ['FPL'];

	const toBase = fraction(3, 4), toCrit = math.divide(1, toBase),
		baseLower = math.multiply(math.divide(1, toBase), fraction(2, 4)),
		baseLowest = math.multiply(math.divide(1, toBase), fraction(1, 4));
	const coeffsBySet = [ // Tailing conditions have higher priority.
		[{ cd: 1, cr: 2, atk: 1, def: baseLower, hp: baseLower, er: baseLower, em: baseLower }],
		[...lovesDEF, { def: 1 }],
		[...lovesHP, { hp: 1 }],
		[...sets.atk, 'WT', 'GD', { def: 0, hp: 0 }],
		[...sets.def, { hp: 0 }],
		[...sets.hp, { def: 0 }],
		[...neglectsEM, { em: baseLowest }],
		[...sets.em, ...lovesEM, 'NO', 'ESF', 'SHCC', { em: 1 }], // roll(EM) = roll(BD) // TODO? GD:(50/19.5)/(14/4.95), ...?
		[...mainsEM, { em: toCrit }], // roll(EM) = roll(CD)
		[...sets.er, 'NO', 'MB', 'GT'/*Furina C4-*/, 'NSU'/* Flins&Lauma */, { er: 1 }], // roll(ER) = roll(BD)
		['HOD', 'VV', { atk: baseLower }], // [Noelle] roll(ATK) = 1/2 roll(CD) | (ATK+EM) for VV.
		['VG', { hp: baseLower }], // [Dehya] roll(HP) = 1/2 roll(CD)
		['BS'/*unfreezables*/, 'MH', 'OC', 'NSU', { cr: math.multiply(2, toBase) }], // roll(CR) = roll(BD)
		['OHC', { atk: 1, def: 1, hp: 1, er: 1, em: 1 }], // roll(BD) = roll(EM) = roll(ER) = 3/4 roll(CD)
		['bare', { atk: 0, def: 0, hp: 0, er: 1, em: 0 }],
		['reset', { atk: 1, def: 1, hp: 1, er: 1, em: 1 }],
	];
	const dedoubleBySet = [ // Searching sets from tail. // TODO { sets: [], groups: []}
		[['atk', 'def', 'hp', 'em']], // CV+ATK/DEF/HP/EM
		[...lovesEM, ...mainsEM, ..._.without(sets.em, 'WT'), 'VV', ['atk', 'def', 'hp']], // CV+ATK/DEF/HP+EM
		['CWF', [['atk', 'hp'], 'def']], // CV+(ATK+HP)/DEF+EM
		['VG', [['atk', 'hp'], 'def', 'em']], // CV+(ATK+HP)/DEF/EM
		['HOD', [['atk', 'def'], 'hp', 'em']], // CV+(ATK+DEF)/HP/EM
	];

	// Language extensions.
	const coeffsBy = (set) => _.assign({ }, ...coeffsBySet.map(row => row.length == 1 || row.includes(set) ? _.last(row) : { }));
	const dedoubleBy = (set) => _.last(_.findLast(dedoubleBySet, row => row.length == 1 || set && row.includes(set))) || [];
	const barefy = (coeffs) => _.assign({ }, coeffs, { atk: 0, def: 0, hp: 0, em: 0 });
	// const adaptiveEM() EM dependant on goblet element (elemental & physical).

	const rule = function(...args) {
		const dd = _.isFunction(args[0]) ? undefined : args.shift();
		const fn = _.isFunction(args[0]) ? args[0] : undefined;
		if(!fn) throw new ReferenceError("Rule definition is required for rule wrapper.");

		return function(a, c) {
			if(Ruleset.disabledIn(c, a.affix)) return false;
			if(dd === undefined || _.isArray(dd) && dd.length) {
				const reset = Ruleset.dedouble(a, fn.length > 1 ? c : { }, ...(dd || dedoubleBy(a.set)));
				reset.length && a.clearStats(...reset);
			}
			return fn(a, c);
		}
	}
	const rules = (list) => new Ruleset(null, list);

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

	const utility = function(affix, tweak = 0) {
		const AFFIX = _.upperCase(affix);
		let rules = {};
		tweak = Math.min(1, Math.max(-1, tweak));

		const ip = Math.max(0, tweak); // Only strict rules.
		rules[`⚙️ [${AFFIX}+] [~fp~] | (${AFFIX}/CR)+ER ≥ ×${6 + ip}`] =
			rule(false, a => a.flower_plume() && largerEq(add(...summax(a, ['er'], [affix, 'cr'])), 6 + ip));
		rules[`⚙️ [${AFFIX}+] [~fp~] | ${AFFIX}+ER+CR ≥ ×${7 + ip}`] =
			rule(false, a => a.flower_plume() && largerEq(rSum(a, [affix, 'er', 'cr']), 7 + ip));
		rules[`⚙️ [${AFFIX}+] ER/CR[~sc~] | ER/CR ≥ ×${4 + ip}`] =
			rule(false, a => a.affixIn('er', 'cr') && largerEq(rMax(a, ['er', 'cr']), 4 + ip));

		const im = Math.min(0, tweak); // Only loose rules.
		rules[`⚙️ [${AFFIX}+] [${AFFIX}][~sgc~] | CR ≥ ×${5 + im}`] =
			rule(false, a => a.affixIn(affix) && largerEq(rMax(a, ['cr']), 5 + im));

		const i = tweak; // Loose and strict rules.
		rules[`⚙️ [${AFFIX}+] [${AFFIX}][~sgc~] | ER ≥ ×${4 + i}`] =
			rule(false, a => a.affixIn(affix) && largerEq(rMax(a, ['er']), 4 + i));
		rules[`⚙️ [${AFFIX}+] [${AFFIX}][~sgc~] | ER+CR ≥ ×${6 + i}`] =
			rule(false, a => a.affixIn(affix) && largerEq(rSum(a, ['er', 'cr']), 6 + i));
		rules[`⚙️ [${AFFIX}+] ER/CR[~sc~] | ${AFFIX} ≥ ×${4 + i}`] =
			rule(false, a => a.affixIn('er', 'cr') && largerEq(rMax(a, [affix]), 4 + i));
		rules[`⚙️ [${AFFIX}+] ER/CR[~sc~] | ${AFFIX}+ER+CR ≥ ×${5 + i}`] =
			rule(false, a => a.affixIn('er', 'cr') && largerEq(rSum(a, [affix, 'er', 'cr']), 5 + i));

		return rules;
	};

	ruleset = new Ruleset(coeffsBy(), {
		'⚙️ ER ≥ 30% (off-set)': rule(false, a => !a.sands() && a.er >= 30), // Mostly for Mona.
		'⚙️ ER+CR ≥ ×7 (off-set)': rule(false, a => largerEq(rSum(a, ['er', 'cr']), 7)), // Mostly for Rosaria.
		'⚔︎ EM[~sgc~] | Q ≥ 5×CV (off-set)': rule(dedoubleBy(), a => a.affixIn('em') && qLargerEq(a, coeffsBy('bare'), { cd: 5 })),

		'⚔︎ Q[~fp~] ≥ 7×CD (off-set)': rule(dedoubleBy(), a => a.flower_plume() && qLargerEq(a, coeffsBy('reset'), { cd: 7 })),

		'⚔︎ ER[~s~] | Q ≥ 5×CV (off-set)': rule(dedoubleBy(), a => a.sands('er') && qLargerEq(a, coeffsBy('bare'), { cd: 5 })),
		'⚔︎ BD[~s~] | Q ≥ 6×CD (off-set)': rule(dedoubleBy(), a => a.sands('bd') && qLargerEq(a, coeffsBy('reset'), { cd: 6 })),

		'⚔︎ ED[~g~] | Q ≥ 5×CV (off-set)': rule(dedoubleBy(), a => a.goblet('ed') && qLargerEq(a, coeffsBy('bare'), { cd: 5 })),
		'⚔︎ ED[~g~] | Q ≥ 6×CD (off-set)': rule(dedoubleBy(), a => a.goblet('ed') && qLargerEq(a, coeffsBy('reset'), { cd: 6 })),
		'⚔︎ BD[~g~] | Q ≥ 6×CD (off-set)': rule(dedoubleBy(), a => a.goblet('bd') && qLargerEq(a, coeffsBy('reset'), { cd: 6 })),
		'⚔︎ PD[~g~] | Q ≥ 6×CV (off-set)': rule(dedoubleBy(), a => a.goblet('pd') && qLargerEq(a, coeffsBy('bare'), { cd: 6 })),

		'⚔︎ CV[~c~] | Q ≥ 4×CV (off-set)': rule(dedoubleBy(), a => a.circlet('cv') && qLargerEq(a, coeffsBy('bare'), { cd: 4 })),
		'⚔︎ CV[~c~] | Q ≥ 5×CD (off-set)': rule(dedoubleBy(), a => a.circlet('cv') && qLargerEq(a, coeffsBy('reset'), { cd: 5 })),
		'⚔︎ BD[~c~] | Q ≥ 7×CD (off-set)': rule(dedoubleBy(), a => a.circlet('bd') && qLargerEq(a, coeffsBy('reset'), { cd: 7 })),

		'⚕️ HB[~c~] | ER/BD/EM/CR ≥ ×5 (off-set)': rule(false, a => a.circlet('hb') && largerEq(rMax(a, ['er', 'bd', 'em', 'cr']), 5)),
		'⚕️ HB[~c~] | CV ≥ ×6 (off-set)': rule(false, a => a.circlet('hb') && largerEq(rSum(a, ['cr', 'cd']), 6)),
		'⚕️ HB[~c~] | ER+(BD/EM/CR) ≥ ×6 (off-set)': rule(false, a => a.circlet('hb') && largerEq(add(...summax(a, 'er', ['bd', 'em', 'cr'])), 6)),
		'⚕️ HB[~c~] | ER+CV ≥ ×7 (off-set)': rule(false, a => a.circlet('hb') && largerEq(rSum(a, ['er', 'cr', 'cd']), 7)),
		'⚕️ HB[~c~] | CR+(BD/EM) ≥ ×7 (off-set)': rule(false, a => a.circlet('hb') && largerEq(add(...summax(a, 'cr', ['bd', 'em'])), 7)),
		'⚕️ HB[~c~] | ER+CR+(BD/EM) ≥ ×8 (off-set)': rule(false, a => a.circlet('hb') && largerEq(add(...summax(a, ['er', 'cr'], ['bd', 'em'])), 8)),
	}, [
		new Ruleset((a) => coeffsBy(a.set), { // Set dependant category.
			'⚔︎ Q[~fp~] ≥ 6×CD': rule((a, c) => a.flower_plume() && qLargerEq(a, c, { cd: 6 })),

			'⚔︎ ATK/ER[~s~] | Q ≥ 4×CV': rule((a, c) => a.sands('atk', 'er') && qLargerEq(a, barefy(c), { cd: 4 })),
			'⚔︎ BD/ER[~s~] | Q ≥ 5×CD': rule((a, c) => a.sands('bd', 'er') && qLargerEq(a, c, { cd: 5 })),

			'⚔︎ BD[~g~] | Q ≥ 5×CD': rule((a, c) => a.goblet('bd') && qLargerEq(a, c, { cd: 5 })),

			'⚔︎ CD[~c~] | Q ≥ 5×BD': rule((a, c) => a.circlet('cd') && largerEq(quality(a, c, 0), 5*5)),
			'⚔︎ CR[~c~] | Q ≥ 5×BD': rule((a, c) => a.circlet('cr') && !a.setIn(...sets.cr) && largerEq(quality(a, c, 0), 5*5)), // Using another rule for CR+ sets.
			'⚔︎ BD[~c~] | Q ≥ 6×CD': rule((a, c) => a.circlet('bd') && qLargerEq(a, c, { cd: 6 })),
		}, [
			(a) => matchSetBonus(a) && rules({ // In-set goblets & helmets.
				'⚔︎ ED[~g~] | Q ≥ 4×CV': rule((a, c) => a.goblet('ed') && qLargerEq(a, barefy(c), { cd: 4 })),
				'⚔︎ ED[~g~] | Q ≥ 5×CD': rule((a, c) => a.goblet('ed') && qLargerEq(a, c, { cd: 5 })),
				'⚔︎ PD[~g~] | Q ≥ 5×CV': rule((a, c) => a.goblet('pd') && qLargerEq(a, barefy(c), { cd: 5 })),
				'⚔︎ PD[~g~] | Q ≥ 6×CD': rule((a, c) => a.goblet('pd') && qLargerEq(a, c, { cd: 6 })),

				'⚕️ HB[~c~] | CV ≥ ×5': rule(false, a => a.circlet('hb') && largerEq(rSum(a, ['cr', 'cd']), 5)),
				'⚕️ HB[~c~] | ER+(BD/EM/CR) ≥ ×3': rule(false, a => a.circlet('hb') && largerEq(add(...summax(a, 'er', ['bd', 'em', 'cr'])), 3)),
				'⚕️ HB[~c~] | ER+CV ≥ ×6': rule(false, a => a.circlet('hb') && largerEq(rSum(a, ['er', 'cr', 'cd']), 6)),
				'⚕️ HB[~c~] | CR+(BD/EM) ≥ ×4': rule(false, a => a.circlet('hb') && largerEq(add(...summax(a, 'cr', ['bd', 'em'])), 4)),
				'⚕️ HB[~c~] | ER+CR+(BD/EM) ≥ ×5': rule(false, a => a.circlet('hb') && largerEq(add(...summax(a, ['er', 'cr'], ['bd', 'em'])), 5)),
			}),
			(a) => a.setIn(...sets.cr) && rules({ // Sets with CR bonus.
				'⚔︎ [CR+] [~fp~] | CD ≥ ×5': rule(a => a.flower_plume() && largerEq(rMax(a, ['cd']), 5)),
				'⚔︎ [CR+] [~fp~] | CR ≥ ×6': rule(a => a.flower_plume() && largerEq(rMax(a, ['cr']), 6)),
				// Redundant by off-set rule: '⚔︎ [CR+] BD/EM[~sg~] | CR ≥ ×6': rule(a => !a.circlet() && a.affixIn('bd', 'em') && largerEq(rMax(a, ['cr']), 6)),
				// Redundant by off-set rule: '⚔︎ [CR+] ED[~g~] | CR ≥ ×5': rule(a => a.goblet('ed') && matchSetBonus(a) && largerEq(rMax(a, ['cr']), 5)),
				'⚔︎ [CR+] BD/EM[~c~] | CD ≥ ×5': rule(a => a.circlet('bd', 'em') && largerEq(rMax(a, ['cd']), 5)),
				'⚔︎ [CR+] CR[~c~] | Q ≥ 5×CR': rule((a, c) => a.circlet('cr') && qLargerEq(a, c, { cr: 5 })),
				'⚔︎ [CR+] CD[~c~] | Q ≥ 4×CR': rule((a, c) => a.circlet('cd') && qLargerEq(a, c, { cr: 4 })),
			}),
			(a) => a.setIn(...lovesDEF) && rules({ // Sets with lower DEF% requirements.
				'⚔︎ DEF[~s~] | Q ≥ 4×CV': rule((a, c) => a.sands('def') && qLargerEq(a, barefy(c), { cd: 4 })),
			}),
			(a) => a.setIn(...lovesHP) && rules({ // Sets with lower HP% requirements.
				'⚔︎ HP[~s~] | Q ≥ 4×CV': rule((a, c) => a.sands('hp') && qLargerEq(a, barefy(c), { cd: 4 })),
			}),
			(a) => !a.setIn(...neglectsEM) && rules({ // Sets with lower EM requirements.
				'⚔︎ EM[~sg~] | Q ≥ 4×CV': rule((a, c) => !a.circlet() && a.affixIn('em') && qLargerEq(a, barefy(c), { cd: 4 })),
				'⚔︎ EM[~sg~] | Q ≥ 5×CD': rule((a, c) => !a.circlet() && a.affixIn('em') && qLargerEq(a, c, { cd: 5 })),
			}),

			(a) => a.setIn('NO', 'MB', 'VV', 'AP', 'OHC', 'DM', 'SDP', 'SHCC', 'SMS') && rules(utility('atk')), // Sets that wants ER% & ATK% utility parts.
			(a) => a.setIn(...sets.def, 'AP', 'SHCC', 'SMS') && rules(utility('def')), // Sets that wants ER% & DEF% utility parts.
			(a) => a.setIn(...sets.hp, 'NO', 'MB', 'AP', 'OHC', 'DM', 'SDP', 'SMS') && rules(utility('hp')), // Sets that wants ER% & HP% utility parts.
			(a) => a.setIn('NO', 'DM', 'GD', 'SMS') && rules(utility('em')), // Sets that wants ER% & EM utility parts.

			(a) => a.setIn(...sets.atk) && rules(utility('atk', +1)), // Widespread sets with ATK bonus that wants ER% & ATK% utility parts.
			(a) => a.setIn('NO', 'MB', 'VV', 'OHC', 'DM', 'SDP') && rules(utility('def', +1)), // Sets that low-priority wants ER% & DEF% utility parts.
			(a) => a.setIn('VV', 'SHCC') && rules(utility('hp', +1)), // Sets that low-priority wants ER% & HP% utility parts.
			(a) => a.setIn('WT', 'MB', 'AP', 'OHC', 'SDP', 'NSU', 'AMM') && rules(utility('em', +1)), // Combat sets that wants ER% & EM utility parts.
			(a) => a.setIn('VV', 'FPL', 'SHCC') && rules(utility('em', -1)), // Sets that high-priority wants ER% & EM utility parts.

			(a) => a.setIn(...sets.atk) && rules({ // Fixes for BD+ sets.
				'⚙️ [ATK+] [~fp~] | ATK ≥ ×6': rule(false, a => a.flower_plume() && largerEq(rMax(a, ['atk']), 6)),
			}), (a) => a.setIn(...sets.def) && rules({
				'⚙️ [DEF+] [~fp~] | DEF ≥ ×6': rule(false, a => a.flower_plume() && largerEq(rMax(a, ['def']), 6)),
			}), (a) => a.setIn(...sets.hp) && rules({
				'⚙️ [HP+] [~fp~] | HP ≥ ×5': rule(false, a => a.flower_plume() && largerEq(rMax(a, ['hp']), 5)),
			}), (a) => a.setIn(...sets.em) && rules({
				'⚙️ [EM+] [~fp~] | EM ≥ ×6': rule(false, a => a.flower_plume() && largerEq(rMax(a, ['em']), 6)),
			}), (a) => a.setIn('GD', 'FPL') && rules({
				'⚙️ [EM+] [~fp~] | EM ≥ ×5': rule(false, a => a.flower_plume() && largerEq(rMax(a, ['em']), 5)),
			}),

			(a) => a.setIn('NO', 'SHCC', 'SMS') && rules({ // Utility tweaks for specific sets.
				'⚙️ [BD+] ER[~s~] | BD/EM ≥ ×3': rule(false, a => a.affixIn('er') && largerEq(rMax(a, ['bd', 'em']), 3)), // TODO ?
			}), (a) => a.setIn('NO') && rules({ // Mostly for Bennett/Thoma/Shenhe/Layla/Mika/Rosaria/Xianyun/Chevreuse.
				'⚙️ [NO] [~fp~] | CR+(ATK/HP/EM) ≥ ×6': rule(false, a => a.flower_plume() && largerEq(add(...summax(a, 'cr', ['atk', 'hp', 'em'])), 6)),
				'⚙️ [NO] ATK/HP/EM[~sgc~] | ER+CR ≥ ×5': rule(false, a => a.affixIn('atk', 'hp', 'em') && largerEq(rSum(a, ['er', 'cr']), 5)),
			}), (a) => a.setIn('SHCC') && rules({ // Mostly for Kachina/Xilonen/Citlali/Iansan.
				'⚙️ [SHCC] [~fp~] | CR+(ATK/DEF/EM) ≥ ×6': rule(false, a => a.flower_plume() && largerEq(add(...summax(a, 'cr', ['atk', 'def', 'em'])), 6)),
				'⚙️ [SHCC] ATK/DEF/EM[~sgc~] | ER+CR ≥ ×5': rule(false, a => a.affixIn('atk', 'def', 'em') && largerEq(rSum(a, ['er', 'cr']), 5)),
			}), (a) => a.setIn('SMS') && rules({ // Mostly for Aino/Jahoda/Illuga.
				'⚙️ [SMS] [~fp~] | CR+(BD/EM) ≥ ×6': rule(false, a => a.flower_plume() && largerEq(add(...summax(a, 'cr', ['bd', 'em'])), 6)),
				'⚙️ [SMS] BD/EM[~sgc~] | ER+CR ≥ ×5': rule(false, a => a.affixIn('bd', 'em') && largerEq(rSum(a, ['er', 'cr']), 5)),
			}), (a) => a.setIn('FPL') && rules({ // Mostly for Nilou/Kuki/Thoma. TODO Durin?
				'⚙️ [FPL] [~fp~] | HP ≥ ×4': rule(a => a.flower_plume() && largerEq(rMax(a, ['hp']), 4)),
				'⚙️ [FPL] [~fp~] | HP+(EM/ER) ≥ ×6': rule(a => a.flower_plume() && largerEq(add(...summax(a, 'hp', ['em', 'er'])), 6)),
				'⚙️ [FPL] [~fp~] | HP+EM+ER ≥ ×7': rule(a => a.flower_plume() && largerEq(rSum(a, ['hp', 'em', 'er']), 7)),
				'⚙️ [FPL] HP[~sgc~] | EM/ER ≥ ×3': rule(a => a.affixIn('hp') && largerEq(rMax(a, ['em', 'er']), 3)),
				'⚙️ [FPL] HP[~sgc~] | EM+ER ≥ ×5': rule(a => a.affixIn('hp') && largerEq(rSum(a, ['em', 'er']), 5)),
				'⚙️ [FPL] EM[~sgc~] | HP ≥ ×5': rule(a => a.affixIn('em') && largerEq(rMax(a, ['hp']), 5)),
				'⚙️ [FPL] EM[~sgc~] | HP+ER ≥ ×6': rule(a => a.affixIn('em') && largerEq(rSum(a, ['hp', 'er']), 5)),
			}),

			(a) => a.setIn(...sets.er) && rules({ // Sets with full utility rules (for all stats).
				'⚙️ [ER+] [~fp~] | ER/CR ≥ ×5': rule(false, a => a.flower_plume() && largerEq(rMax(a, ['er', 'cr']), 5)),
				'⚙️ [ER+] [~fp~] | ER+(BD/EM/CR) ≥ ×6': rule(false, a => a.flower_plume() && largerEq(add(...summax(a, 'er', ['bd', 'em', 'cr'])), 6)),
				'⚙️ [ER+] [~fp~] | CR+(BD/EM) ≥ ×7': rule(false, a => a.flower_plume() && largerEq(add(...summax(a, 'cr', ['bd', 'em'])), 7)),
				'⚙️ [ER+] [~fp~] | ER+CR+(BD/EM) ≥ ×8': rule(false, a => a.flower_plume() && largerEq(add(...summax(a, ['er', 'cr'], ['bd', 'em'])), 8)),
				'⚙️ [ER+] EM[~sgc~] | ER/CR ≥ ×4': rule(false, a => a.affixIn('em') && largerEq(rMax(a, ['er', 'cr']), 4)),
				'⚙️ [ER+] BD[~sgc~] | ER/CR ≥ ×5': rule(false, a => a.affixIn('bd') && largerEq(rMax(a, ['er', 'cr']), 5)),
				'⚙️ [ER+] BD/EM[~sgc~] | ER+CR ≥ ×6': rule(false, a => a.affixIn('bd', 'em') && largerEq(rSum(a, ['er', 'cr']), 6)),
				'⚙️ [ER+] ER/CR[~sc~] | ER/BD/EM/CR ≥ ×4': rule(false, a => a.affixIn('er', 'cr') && largerEq(rMax(a, ['er', 'bd', 'em', 'cr']), 4)),
				'⚙️ [ER+] ER/CR[~sc~] | (ER/CR)+(BD/EM) ≥ ×5': rule(false, a => a.affixIn('er', 'cr') && largerEq(add(...summax(a, ['er', 'cr'], ['bd', 'em'])), 5)),
				'⚕️ [ER+] HB[~c~] | ER/BD/EM/CR ≥ ×4': rule(false, a => a.affixIn('hb') && largerEq(rMax(a, ['er', 'bd', 'em', 'cr']), 4)),
				'⚕️ [ER+] HB[~c~] | CV ≥ ×5': rule(false, a => a.circlet('hb') && largerEq(rSum(a, ['cr', 'cd']), 5)),
				'⚕️ [ER+] HB[~c~] | ER+(BD/EM/CR) ≥ ×5': rule(false, a => a.affixIn('hb') && largerEq(add(...summax(a, 'er', ['bd', 'em', 'cr'])), 5)),
				'⚕️ [ER+] HB[~c~] | ER+CV ≥ ×6': rule(false, a => a.circlet('hb') && largerEq(rSum(a, ['er', 'cr', 'cd']), 6)),
				'⚕️ [ER+] HB[~c~] | CR+(BD/EM) ≥ ×5': rule(false, a => a.affixIn('hb') && largerEq(add(...summax(a, 'cr', ['bd', 'em'])), 5)),
				'⚕️ [ER+] HB[~c~] | ER+CR+(BD/EM) ≥ ×6': rule(false, a => a.affixIn('hb') && largerEq(add(...summax(a, ['er', 'cr'], ['bd', 'em'])), 6)),
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
	coeffsFor = (a) => coeffsBy(a?.set);
	groupsFor = (a) => dedoubleBy(a?.set);
})();
