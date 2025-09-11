/* Uses rolls of average values for forecating because expectation of high rolls
	 is unrealistic and probably not worth the exp loss by salvaging. */
function forecast(artifact, average, rolls) {
	if(rolls < 1) return [artifact];
	let keys = _.filter(_.keys(average), k => artifact[k] > 0), rows = [];
	for(const d of distribute4(rolls)) // Slicing & mapping.
		rows.push(keys.reduce((a, v, i) => ({ ...a, [v]: d[i] }), { }));
	if(keys.length < 4) // Deduplicating.
		rows = _.uniqWith(rows, _.isEqual);
	for(let i = 0; i < rows.length; i++) // Scaling.
		rows[i] = _.assign(_.clone(artifact), _.mapValues(rows[i], (v, k) => artifact[k] + average[k] * v));
	return rows;
}

function *setsChunk(n = 2) {
	for (let j = 0; j < n; j++)
		for (let i = 0, c = db.sets.length / n; i < c; i++)
			yield db.sets[i * n + j];
}

function statsDisplay(rolls, average, approx = false) {
	return Object.fromEntries(_.map(rolls, (v, k) => {
		const n = _.kebabCase(k), p = n == k ? 0 : 1, m = average[n];
		const title = _.toUpper(k), step = _.round(approx ? m : 0.1, p);
		const min = 0; //_.ceil(approx ? step : _.min(v), p);
		const max = _.ceil((approx ? step : _.max(v)) * 6, p);
		return [n, { title, step, min, max }];
	}));
}

function affixesDisplay(slot, chances, elements) {
	if ((slot = parseInt(slot)) < 2)
		return { 'hp_atk': 'HP/ATK' };
	let affixes = Object.fromEntries(_.map(chances[slot], (v, k) => [_.kebabCase(k), _.toUpper(k)]));
	if(slot == 3) {
		_.each(elements, v => affixes[_.kebabCase(v.name)] = v.name);
		delete affixes.ed;
		delete affixes.pd;
		affixes['pd'] = 'Physical';
	}
	return affixes;
}

function ready(target, template) {
	var ractive = new Ractive({
		target: target,
		template: template,
		data: {
			artifact: _.set(new Artifact(), 'level', 20),
			coeffs: coeffsFor(),
			quality: null,
			verdict: undefined,
			summary: { },
			messages: [],

			approx: true,
			sets: [...this.setsChunk()],
		},
		computed: {
			stats() { return statsDisplay(db.stats.artifact.rolls, Artifact.average, this.get('approx')); },
			affixes() { return affixesDisplay(this.get('artifact.slot'), db.stats.artifact.major, db.elements); },
		},
		on: {
			statChange(context, name) { this.set('artifact.' + name, context.node.value); },
			rangeSet(context, name) { context.node.closest('tr').querySelector('input[type="range"]').value = context.node.value; },
			clear(context) {
				this.set({ artifact: _.mapValues(Artifact.average, () => null) }, { deep: true });
				_.each(context.node.closest('table').querySelectorAll('.stat-row input[type="range"]'), el => el.value = 0);
			}
		},
		verdictAsClass: (v, n, z, p) => [v => v > 0 && p, v => v === 0 && z, v => v < 0 && n].reduce((a, f) => a || f(v), false) || null,
		decimal: (n, d = 2, p = '') => _.isNil(n) ? p : _.round(n, d),
		fraction(n, d) {
			if(!_.isNil(d)) n = math.fraction(n, d);
			return math.typeOf(n) == 'Fraction' ? new math.ConstantNode(n) : this.decimal(n, 3);
		},
		filled(max) {
			const a = this.get('artifact');
			return _.reduce(this.get('stats'), (r, v, k) => {
				if(a[k] > 0 && !a.affixIn(k) && (_.isNil(max) || max-- > 0)) r[k] = v.title;
				return r;
			}, { })
		},
		summary(key, value) { this.set('summary.' + key, value); return this; },
		message(text, verdict = null, artifact = null, formula = null) {
			let v = this.get('verdict'), type = this.verdictAsClass(verdict, 'error', '', 'rule') || '';
			verdict = v < 0 || (v > 0 && verdict === 0) ? null : verdict; // Error > Rule > Generic.
			if(!_.isNil(verdict) && v !== verdict) this.set('verdict', verdict);
			this.push('messages', { type: type, text: text, artifact: artifact, formula: formula });
		},
		promising(name, rule, artifact) {
			const f = rule instanceof math.Node ? formula.render(rule) : null;
			this.message(name, +Infinity, artifact, f);
		},
		calculate() {
			let a = this.get('artifact').valid(), c = coeffsFor(a),
				stats_filled = _.sumBy(_.keys(Artifact.average), k => a[k] > 0 ? 1 : 0);
			this.set('coeffs', c);

			if (stats_filled < 1) return; // Empty artifact stats.
			this.set('quality', formula.quality(a, c, 2));
			if (!_.isFinite(a.level)) return; // Forecast impossible without level.
			if (stats_filled > 4)
				this.message("Artifact can't have more than 4 stats.", -Infinity);
			if (this.get('verdict') < 0) return; // There are critical errors.

			_.reduce(Artifact.average, (_, v, k) => a[k] = a[k] > 0 ? a[k] : 0, null); // Default values for the scope.
			let rolls = Math.floor(a.level / 4), left = 5 - rolls, variants = forecast(a, Artifact.average, left);
			this.summary('rolls', `${rolls} / ${left}`).summary('forecasts', variants.length), rules = 0;
			for(let { name, rule, coeffs } of ruleset.for(a)) {
				for(const variant of variants) {
					let expr = _.isFunction(rule) ? rule.call(ruleset, variant, coeffs) : rule,
						is = expr instanceof math.Node ? formula.evaluate(expr, Ruleset.scope(variant, coeffs)) : expr;
					if(!_.isBoolean(is))
						this.message(`Unsupported rule ${name}.`, -Infinity);
					else if(is) {
						// console.log(name, coeffs, variant);
						this.promising(name, expr, variant);
						break;
					}
				}
				rules++;
			}
			_.isNil(this.get('verdict')) && this.set('verdict', 0);
			this.summary('rules', rules);
		},
	});

	const refresh = _.debounce(function() {
		this.set('verdict', undefined);
		this.set('quality', null);
		this.set('messages', []);
		this.set('summary', { });
		this.calculate();
	}, 100);
	ractive.observe('artifact.*', function(value, old, path) {
		if(path == 'artifact.slot') {
			const affixes = this.get('affixes'), _default = 'atk';
			if(!(this.get('artifact.affix') in affixes))
				this.set('artifact.affix', (_default in affixes) ? _default : _.first(_.keys(affixes)))
		}
		refresh.call(this);
	});
}
