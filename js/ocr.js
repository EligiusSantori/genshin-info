var temporaryImage, ocrParseScreenshot, ocrParseArtifact; // Export.
var _ocrWorker = null, _ocrLogger = null; // Cache.

(function() {
	temporaryImage = function(blob, onLoad, onError) {
		return new Promise(function(resolve, reject) {
			const image = new Image();
			image.onerror = (error) => {
				image.src && image.src.startsWith('blob:') && URL.revokeObjectURL(image.src);
				reject(onError(error));
			};
			image.onload = async() => {
				try { resolve(await onLoad(image)); }
				catch(error) { reject(onError(error)); }
				finally { image.src && image.src.startsWith('blob:') && URL.revokeObjectURL(image.src); }
			};
			image.src = URL.createObjectURL(blob);
		});
	}

	class Rectangle {
		constructor(data = null) {
			if(!_.isEmpty(data))
				Object.assign(this, _.pick(data, ['left', 'width', 'top', 'height']));
			else
				Object.assign(this, { left: 0, width: 0, top: 0, height: 0 });
		}

		area() {
			return this.width * this.height;
		}

		aspect() {
			return this.width / this.height;
		}

		toAbsolute(absolute) {
			if(absolute.width <= 0 || absolute.height <= 0)
				throw new Error('Invalid dimensions.');
			return new Rectangle({
				left: this.left * absolute.width,
				width: this.width * absolute.width,
				top: this.top * absolute.height,
				height: this.height * absolute.height,
			});
		}

		toInscribed(inscribed) {
			if(inscribed.width <= 0 || inscribed.height <= 0)
				throw new Error('Invalid dimensions.');
			return new Rectangle({
				left: this.left + inscribed.left * this.width,
				top: this.top + inscribed.top * this.height,
				width: this.width * inscribed.width,
				height: this.height * inscribed.height,
			});
		}
	}

	function rgbToHsv(r, g, b) {
		r /= 255; g /= 255; b /= 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let [h, s, v] = [0, 0, max];
		const d = max - min;
		s = max === 0 ? 0 : d / max;
		if(max === min)
			return [0, s * 100, v * 100];
		let hh;
		if(max === r) hh = (g - b) / d + (g < b ? 6 : 0);
		else if(max === g) hh = (b - r) / d + 2;
		else hh = (r - g) / d + 4;
		return [(hh * 60) % 360, s * 100, v * 100];
	}

	// Removes small (< (2radius+1)x(2radius+1)) white spots.
	function erodeMask(maskData, width, height, radius = 1) {
		const newData = new Uint8ClampedArray(maskData.data);
		const src = maskData.data;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const i = (y * width + x) * 4;
				let isAllFit = src[i] > 128;  // Center.
				for (let dy = -radius; dy <= radius; dy++) {
					for (let dx = -radius; dx <= radius; dx++) {
						const nx = x + dx, ny = y + dy;
						if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
							const ni = (ny * width + nx) * 4;
							if (src[ni] <= 128) {  // If at least one is black fill black.
								isAllFit = false;
								break;
							}
						}
					}
					if (!isAllFit) break;
				}
				newData[i] = newData[i + 1] = newData[i + 2] = isAllFit ? 255 : 0;
				newData[i + 3] = 255;
			}
		}
		return new ImageData(newData, width, height);
	}

	// Connects together small (< (2radius+1)x(2radius+1)) white spots.
	function dilateMask(maskData, width, height, radius = 1) {
		const newData = new Uint8ClampedArray(maskData.data);
		const src = maskData.data;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const i = (y * width + x) * 4;
				let isColorFit = src[i] > 128;
				for (let dy = -radius; dy <= radius; dy++) {
					for (let dx = -radius; dx <= radius; dx++) {
						const nx = x + dx, ny = y + dy;
						if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
							const ni = (ny * width + nx) * 4;
							if (src[ni] > 128) {
								isColorFit = true;
								break;
							}
						}
					}
					if(isColorFit) break;
				}
				newData[i] = newData[i + 1] = newData[i + 2] = isColorFit ? 255 : 0;
				newData[i + 3] = 255;
			}
		}
		return new ImageData(newData, width, height);
	}


	// Finds the bounding rectangle of the largest connected component of white pixels (value > 128) in the mask.
	// "Largest" is determined by the number of pixels in the component (size).
	// The bounding rectangle may enclose black pixels (holes) inside the component.
	// Returns an object {left: x, top: y, width: w, height: h} with pixel coordinates (or null if no white pixels).
	// Uses 8-connected components (including diagonals).
	function largestBounding(maskData, width, height) {
		const data = maskData.data;
		const visited = Array.from({ length: height }, () => Array(width).fill(false));
		let maxSize = 0;
		let maxRect = null;
		const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

		for(let y = 0; y < height; y++) {
			for(let x = 0; x < width; x++) {
				if(!visited[y][x] && data[(y * width + x) * 4] > 128) {
					// BFS to find connected component
					const queue = [];
					queue.push([x, y]);
					visited[y][x] = true;
					let minX = x, maxX = x, minY = y, maxY = y;
					let size = 1;

					while(queue.length > 0) {
						const [cx, cy] = queue.shift();
						for(const [dx, dy] of directions) {
							const nx = cx + dx, ny = cy + dy;
							if(nx >= 0 && nx < width && ny >= 0 && ny < height &&
								!visited[ny][nx] && data[(ny * width + nx) * 4] > 128) {
								visited[ny][nx] = true;
								queue.push([nx, ny]);
								minX = Math.min(minX, nx);
								maxX = Math.max(maxX, nx);
								minY = Math.min(minY, ny);
								maxY = Math.max(maxY, ny);
								size++;
							}
						}
					}

					if (size > maxSize) {
						maxSize = size;
						maxRect = {
							left: minX,
							top: minY,
							width: maxX - minX + 1,
							height: maxY - minY + 1
						};
					}
				}
			}
		}

		return maxRect;
	}

	function ocrLookupRectangle(canvas, threshold, options = { }) {
		const context = canvas.getContext('2d');

		const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;
		let maskData = context.createImageData(canvas.width, canvas.height);
		const maskPixels = maskData.data;
		for(let i = 0; i < data.length; i += 4) { // Making image monochrome.
			const r = data[i], g = data[i + 1], b = data[i + 2];
			const [h, s, v] = rgbToHsv(r, g, b);
			const isColorFit = h >= threshold.h[0] && h <= threshold.h[1]
							&& s >= threshold.s[0] && s <= threshold.s[1]
								&& v >= threshold.v[0] && v <= threshold.v[1];
			maskPixels[i] = maskPixels[i + 1] = maskPixels[i + 2] = isColorFit ? 255 : 0;
			maskPixels[i + 3] = 255;
		}
		if(options.erode > 0)
			maskData = erodeMask(maskData, canvas.width, canvas.height, options.erode);
		if(options.dilate > 0)
			maskData = dilateMask(maskData, canvas.width, canvas.height, options.dilate);
		if(options.preview)
			context.putImageData(maskData, 0, 0);

		let rectangle = largestBounding(maskData, canvas.width, canvas.height);
		if(!rectangle || rectangle.width == 0 || rectangle.height == 0)
			throw new Error('No region that fits threshold color has been found.');

		return new Rectangle({
			left: rectangle.left / canvas.width,
			top: rectangle.top / canvas.height,
			width: rectangle.width / canvas.width,
			height: rectangle.height / canvas.height,
		});
	}

	// image HTMLImageElement
	// rect {x, y, w, h}
	// filter: 'brightness(1.3) contrast(3) invert(1)'
	// filter: 'grayscale(1) brightness(0.8) contrast(4)'
	const cropArea = async function(image, area) {
		const { naturalWidth: width, naturalHeight: height } = image;
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		const scale = area.scale || 1;
		canvas.width = Math.round(width * area.width * scale);
		canvas.height = Math.round(height * area.height * scale);

		const smooth = _.get(area, 'smooth', true);
		if(scale > 1 && smooth) {
			context.imageSmoothingEnabled = true;
			context.imageSmoothingQuality = 'high';
		}
		if(_.isString(area.filter) && area.filter)
			context.filter = area.filter;

		context.drawImage(image,
			width * area.left, height * area.top, width * area.width, height * area.height,
			0, 0, canvas.width, canvas.height);
		return canvas;
	}

	async function findArtifactCaption(image, lookupRect) {
		const scale = 1 / Math.ceil(1 / (1000 / (lookupRect.width * image.naturalWidth))); // Descaling for optimization: W <= 1000px.
		const canvas = await cropArea(image, _.assign(lookupRect, { scale }));
		const rect = ocrLookupRectangle(canvas, { h: [20, 30], s: [65, 100], v: [65, 100] }, { erode: 2, dilate: 1, preview: 1 });

		const absolute = { width: image.naturalWidth, height: image.naturalHeight };
		const real = lookupRect.toInscribed(rect).toAbsolute(absolute);
		const ratio = real.area() / lookupRect.toAbsolute(absolute).area(), minRatio = 0.05; // 5%.
		if(ratio < minRatio)
			throw new Error(`Area of artifact caption: ${_.round(ratio, 2)} < ${minRatio}.`);
		const aspect =  real.aspect(), minAspect = 5;
		if(aspect < minAspect)
			throw new Error(`Aspect of artifact caption: ${aspect} < ${minAspect}.`);

		return lookupRect.toInscribed(rect);
	}

	async function findArtifactHead(image, lookupRect) {
		return _.assign(lookupRect, {
			scale: 3,
		});
	}

	async function findArtifactBody(image, lookupRect) {
		let canvas = null;
		const scale = 1 / Math.ceil(1 / (1000 / (lookupRect.width * image.naturalWidth))); // Descaling for optimization: W <= 1000px.
		canvas = await cropArea(image, _.assign(lookupRect, { scale }));
		let sandArea = ocrLookupRectangle(canvas, { h: [30, 50], s: [0, 20], v: [80, 100] }, { erode: 2, dilate: 1 });
		sandArea = lookupRect.toInscribed(sandArea);

		const absolute = { width: image.naturalWidth, height: image.naturalHeight };
		const ratio = sandArea.toAbsolute(absolute).area() / lookupRect.toAbsolute(absolute).area(), minRatio = 0.25; // 25%.
		if(ratio < minRatio)
			throw new Error(`Area of artifact body: ${_.round(ratio, 2)} < ${minRatio}.`);

		canvas = await cropArea(image, _.assign(sandArea, { scale }));
		let setArea = ocrLookupRectangle(canvas, { h: [100, 140], s: [30, 70], v: [50, 90] }, { dilate: 10 });
		const aspect = sandArea.toInscribed(setArea).toAbsolute(absolute).aspect(), minAspect = 3;
		if(aspect < minAspect)
			throw new Error(`Aspect of artifact set: ${aspect} < ${minAspect}.`);
		// greenArea = sandArea.toInscribed(greenArea);

		return new Rectangle({
			left: sandArea.left,
			width: sandArea.width,
			top: sandArea.top,
			height: sandArea.height * (setArea.top + setArea.height),
		});
	}

	async function findArtifactLevel(image, lookupRect) {
		const scale = 1 / Math.ceil(1 / (1000 / (lookupRect.width * image.naturalWidth))); // Descaling for optimization: W <= 1000px.
		const canvas = await cropArea(image, _.assign(lookupRect, { scale }));
		let rect = ocrLookupRectangle(canvas, { h: [208, 218], s: [23, 33], v: [26, 36] }, { erode: 0, dilate: 0 });

		const absolute = { width: image.naturalWidth, height: image.naturalHeight };
		const real = lookupRect.toInscribed(rect).toAbsolute(absolute);
		const aspect =  real.aspect(), aspectRange = [2, 3];
		if(aspect <= aspectRange[0] || aspect >= aspectRange[1])
			throw new Error(`Aspect of artifact caption not: ${aspectRange[1]} >= ${aspect} >= ${aspectRange[0]}.`);

		return _.assign(lookupRect.toInscribed(rect), {
			chars: '+0123456789',
			type: Tesseract.PSM.SINGLE_WORD,
			scale: 3,
			smooth: true,
			filter: 'invert(1) grayscale(1)',
		});
	}

	async function findArtifactParts(screenshot) {
		const caption = await findArtifactCaption(screenshot, new Rectangle({ left: 0.5, width: 0.5, top: 0, height: 0.25 }));
		// document.body.replaceChildren(await cropArea(screenshot, caption));
		const body = await findArtifactBody(screenshot, new Rectangle(_.assign({ }, caption, {
			top: caption.top + caption.height,
			height: 1 - caption.top - caption.height,
		})));
		const head = await findArtifactHead(screenshot, new Rectangle({
			left: body.left,
			width: body.width * 0.6,
			top: caption.top + caption.height,
			height: body.top - caption.top - caption.height,
		}));
		const level = await findArtifactLevel(screenshot, new Rectangle(_.assign({}, body, {
			width: body.width * 0.3,
			height: body.height * 0.3,
		})));

		return { head, level, body};
	}

	ocrSliceScreenshot = async function(screenshot, rectangles) { // Parallel crops.
		return Promise.all(_.map(rectangles, r => cropArea(screenshot, r)));
	}

	ocrParseScreenshot = async function(screenshot, log) {
		if(!screenshot.complete || screenshot.naturalWidth === 0)
			throw new Error('Image must be fully loaded');

		const rectangles = await findArtifactParts(screenshot);
		const canvases = await ocrSliceScreenshot(screenshot, rectangles);
		// document.body.replaceChildren(...canvases);

		_ocrLogger = { jobsCount: _.size(rectangles), total: 0, jobId: null };
		if(!_ocrWorker) {
			_ocrWorker = await Tesseract.createWorker('eng', 1, { logger: (worker) => { // TODO Wrap into class.
				const logger = _ocrLogger;
				if(worker.jobId) {
					if(logger.jobId != worker.userJobId) {
						logger.total += logger.jobId != null ? 1 / logger.jobsCount : 0;
						logger.jobId = worker.userJobId;
					}
					const progress = _.isFinite(worker.progress) ? worker.progress : 0;
					log(logger.total + progress / logger.jobsCount, worker);
				}
			}});
		}

		try {
			let results = { }; i = 0;
			for(const name in rectangles) {
				await _ocrWorker.setParameters({
					tessedit_char_whitelist: rectangles[name].chars || "0123456789'.:%+-( )ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
					tessedit_pageseg_mode: rectangles[name].type || Tesseract.PSM.SINGLE_BLOCK
				});
				const { data: { text } } = await _ocrWorker.recognize(canvases[i]);
				results[name] = _.trim(text || '').replace(/(?:\r\n|[\r\n\u2028\u2029])+/g, '\n'); // Removing extra line breaks.
				console.debug(`[OCR:${name}]\n` + results[name]);
				i++;
			}
			return results;
		} finally {
			// await _ocrWorker.terminate(); We caching _ocrWorker to avoid long initialization each time.
		}
	}

	tokenize = function(string, filter = null) {
		string = string.replace(/[^\S\r\n\u2028\u2029]+/g, '');
		if(filter) string = string.replace(filter, '');
		return string.toLowerCase();
	}

	ocrParseArtifact = function({ head, level, body }) {
		const artifact = new Artifact();

		// Parsing head.
		let maxSlot = 0, maxAffix = 0;
		for(let line of head.split('\n')) {
			line = tokenize(line);
			_.forEach(db.artifact.slots, (name, slot) => {
				const match = jaroWinkler(line, tokenize(name));
				if(match >= 0.9 && match > maxSlot)  {
					artifact.slot = slot;
					maxSlot = match;
				}
			});
			_.forOwn(db.artifact.affixes, (name, affix) => {
				const match = jaroWinkler(line, tokenize(name));
				if(match >= 0.9 && match > maxAffix) {
					artifact.affix = tokenize(affix, /[^a-zA-Z]/g);
					maxAffix = match;
				}
			});
		}
		if(artifact.flower_plume())
			artifact.affix = null;

		// Parsing level.
		if(level.match(/\+?(\d{1,2})/))
			artifact.level = parseInt(level);

		// Parsing body.
		let maxSet = 0, maxStats = { }, temp;
		for(let line of body.split('\n')) {
			line = tokenize(line);
			if(temp = line.match(/^(.+?)\+(\d{1,3}(?:\.\d)?%?)(.*)/)) {
				const stat = tokenize(temp[1], /[^a-zA-Z]/g); let value = temp[2];
				_.forOwn(db.artifact.stats, (title, name) => {
					name = tokenize(name, /[^a-zA-Z]/g);
					const match = jaroWinkler(stat, tokenize(title, /[^a-zA-Z]/g));
					if(match >= 0.9 && (!['hp', 'atk', 'def'].includes(name) || value.includes('%')))
						if(!maxStats[name] || match > maxStats[name]) {
							if(name == 'em') value = tokenize(value, /[^0-9]/g);
							artifact[name] = parseFloat(value);
							maxStats[name] = match;
						}
				});
				if(jaroWinkler(temp[3], '(unactivated)') >= 0.85)
					artifact.level = 4; // Pretending artifact level is 4 because since v6 we know last stat anyway.
			} else if(jaroWinkler(line, '(unactivated)') >= 0.85)
				artifact.level = 4; // Pretending artifact level is 4 because since v6 we know last stat anyway.
			else
				_.forOwn(db.sets, ({ name, title }) => {
					const match = jaroWinkler(line, tokenize(title));
					if(match >= 0.85 && (match > maxSet)) {
						artifact.set = name;
						maxSet = match;
					}
				});
		}

		return artifact;
	}
})();
