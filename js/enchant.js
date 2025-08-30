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

function affixesDisplay(chances, slot) {
	return (slot = parseInt(slot)) < 2 ? { 'hp_atk': 'HP/ATK' }
		: Object.fromEntries(_.map(chances[slot], (v, k) => [_.kebabCase(k), _.toUpper(k)]));
}

function ready(target, template) {
	var ractive = new Ractive({
		target: target,
		template: template,
		data: {
			artifact: _.set(new Artifact(), 'level', Artifact.maxLevel),
			coeffs: ruleset.coeffs,
			quality: null,
			verdict: undefined,
			summary: { },
			messages: [],

			approx: true,
			sets: [...this.setsChunk()],
		},
		computed: {
			stats() { return statsDisplay(db.chances.artifact.rolls, Artifact.average, this.get('approx')); },
			affixes() { return affixesDisplay(db.chances.artifact.major, this.get('artifact.slot')); },
		},
		on: {
			statChange(context, name) { this.set('artifact.' + name, context.node.value); },
		},
		verdictAsClass: (v, n, z, p) => [v => v > 0 && p, v => v === 0 && z, v => v < 0 && n].reduce((a, f) => a || f(v), false) || null,
		decimal: (n, d = 2) => n == undefined ? '' : _.round(n, d),
		fraction(n, d) {
			if(!_.isNil(d)) n = math.fraction(n, d);
			return math.typeOf(n) == 'Fraction' ? new math.ConstantNode(n) : this.decimal(n, 3);
		},
		filled(max) {
			const a = this.get('artifact');
			return _.reduce(this.get('stats'), (r, v, k) => {
				if(a[k] > 0 && (_.isNil(max) || max-- > 0)) r[k] = v.title;
				return r;
			}, { })
		},
		clear() { this.set({ artifact: _.mapValues(Artifact.average, () => null) }, { deep: true }); },
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
			let a = this.get('artifact').valid(), c = ruleset.getCoeffs(a.set),
				stats_filled = _.sumBy(_.keys(Artifact.average), k => a[k] > 0 ? 1 : 0);
			this.set('coeffs', c);

			if(stats_filled < 1) return; // Empty artifact stats.
			this.set('quality', Ruleset.quality(a, c));
			if(!_.isFinite(a.level)) return; // Forecast impossible without level.
			if(stats_filled > 4)
				this.message("Artifact can't have more than 4 stats.", -Infinity);
			if(this.get('verdict') < 0) return; // There are critical errors.

			_.reduce(Artifact.average, (_, v, k) => a[k] = a[k] > 0 ? parseFloat(a[k]) : 0, null); // Default values for scope.
			let rolls = Math.floor(a.level / 4), left = 5 - rolls,
				variants = forecast(a, Artifact.average, left), todo = ruleset.getRules(a.set);
			this.summary('rolls', `${rolls} / ${left}`).summary('forecasts', variants.length).summary('rules', _.size(todo));
			for(const f of variants)
				for(const name in todo) {
					let rule = todo[name], is = undefined, temp;
					if(_.isBoolean(temp = _.isFunction(rule) ? rule.call(ruleset, f, c) : null))
						is = temp; // fn() => is.
					else if(temp) // fn() => formula.
						rule = temp;
					if(is === undefined && rule instanceof math.Node)
						is = formula.evaluate(rule, Ruleset.scope(f, c));
					else if(is === undefined)
						this.message(`Unsupported rule ${name}.`, -Infinity);
					if(is) {
						this.promising(name, rule, f);
						delete todo[name];
					}
				}
			if(_.isNil(this.get('verdict')))
				this.set('verdict', 0);
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
