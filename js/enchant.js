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

function ready(target, template) {
	var ractive = new Ractive({
		target: target,
		template: template,
		data: {
			artifact: _.set(new Artifact(), 'level', Artifact.maxLevel),
			coeffs: ruleset.coeffs,
			quality: null,
			verdict: undefined,
			messages: [],
		},
		computed: {
			sets() { return [...this.setsChunk()]; }
		},
		verdictAsClass: (v, n, z, p) => [v => v > 0 && p, v => v === 0 && z, v => v < 0 && n].reduce((a, f) => a || f(v), false) || null,
		*setsChunk(n = 2) {
			for (let j = 0; j < n; j++)
				for (let i = 0, c = db.sets.length / n; i < c; i++)
					yield db.sets[i * n + j];
		},
		clear() {
			this.set({ artifact: _.mapValues(Artifact.average, () => null) }, { deep: true });
		},
		fraction(n, d) {
			if(!_.isNil(d)) n = math.fraction(n, d);
			return math.typeOf(n) == 'Fraction' ? new math.ConstantNode(n) : this.format(n, 3);
		},
		format(n, decimals = 2) {
			if(n == undefined) return '';
			const e = 10 ** decimals;
			return Math.round(n * e) / e;
		},
		message(text, verdict = null, artifact = null) {
			let v = this.get('verdict'), type = this.verdictAsClass(verdict, 'error', '', 'rule') || '';
			verdict = v < 0 || (v > 0 && verdict === 0) ? null : verdict; // Error > Rule > Generic.
			if(!_.isNil(verdict) && v !== verdict) this.set('verdict', verdict);
			this.push('messages', { type: type, text: text, artifact: artifact });
		},
		calculate() {
			let a = this.get('artifact'), c = ruleset.getCoeffs(a.set)
				stats_filled = _.sumBy(_.keys(Artifact.average), k => a[k] > 0 ? 1 : 0);
			this.set('coeffs', c);

			if(stats_filled < 1) return; // Empty artifact stats.
			this.set('quality', Ruleset.quality(a, c));

			if(!_.isFinite(a.level)) return; // Forecast impossible without level.
			let rolls = Math.floor(a.level / 4), left = 5 - rolls;

			if(stats_filled > 4)
				this.message("Artifact can't have more than 4 stats.", -Infinity, a);
			if(this.get('verdict') < 0) return; // There are critical errors.

			let todo = ruleset.getRules(a.set);
			for(const f of forecast(a, Artifact.average, left)) {
				for(const name in todo) {
					let rule = todo[name], result = null, is = false;
					if(_.isFunction(rule))
						result = rule(f, c);
					else if(_.isString(rule))
						result = math.parse(rule);
					else
						this.message(`Unsupported type of rule ${name}.`, -Infinity, f);

					switch(true) {
						case result instanceof math.Node:
							console.log(Ruleset.scope(f, c));
							if(is = formula.evaluate(result, Ruleset.scope(f, c)))
								this.message(name + ': '  + formula.render(result), Infinity, f);
						break;
						case _.isBoolean(result):
							if(is = result)
								this.message(name + '.', Infinity, f);
						break;
						default: this.message(`Unsupported result of rule ${name}.`, -Infinity, f);
					}

					if(is)
						delete todo[name];
				}
			}
			if(_.isNil(this.get('verdict')))
				this.set('verdict', 0);
		},
	});

	ractive.observe('mode.* artifact.*', _.debounce(function() {
		console.log(this.get('artifact'));
		this.set('verdict', undefined);
		this.set('quality', null);
		this.set('messages', []);
		this.calculate()
	}, 10));
}
