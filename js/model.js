// starbase app logic.
// Static data is supplied as a JS object named starbase_static. This file
// implements the logic for simulating a tower fit. The Tower module is
// responsible for most of the simulation work.

Model = (function ($, tower_static) {
	// Tower model class. This class tracks remaining grid/cpu of a given fit
	// and other tower status.
	function Tower() {
		this.type = null;
		this.modules = {};
		this.update_cb = null;
	}

	Tower.prototype.setType = function(type) {
		if (!(type in tower_static['towers'])) {
			return false;
		}
		this.type = type;
		if (this.update_cb) {
			this.update_cb();
		}
		return true;
	}

	Tower.prototype.add = function(mod) {
		if (mod in this.modules) {
			this.modules[mod]++;
		} else {
			this.modules[mod] = 1;
		}
		if (this.update_cb) {
			this.update_cb();
		}
	};

	Tower.prototype.remove = function(mod) {
		if (mod in this.modules) {
			this.modules[mod]--;
			if (this.modules[mod] == 0) {
				delete this.modules[mod];
			}
		}
		if (this.update_cb) {
			this.update_cb();
		}
	}

	Tower.prototype.serialize = function(name) {
		if (this.type === null) {
			return "";
		}
		var serialized = "[" + this.type + ", " + this.type + "]\n\n";
		for (var mod in this.modules) {
			serialized += this.modules[mod] + "x " + mod + "\n";
		}
		return serialized;
	}

	Tower.prototype.getPower = function() {
		if (this.type === null) {
			return 0;
		}
		var power = tower_static['towers'][this.type]['power'];
		for (var mod in this.modules) {
			power -= tower_static['mods'][mod]['power'] * this.modules[mod];
		}
		return power;
	}

	Tower.prototype.getCPU = function() {
		if (this.type === null) {
			return 0;
		}
		var cpu = tower_static['towers'][this.type]['cpu'];
		for (var mod in this.modules) {
			cpu -= tower_static['mods'][mod]['cpu'] * this.modules[mod];
		}
		return cpu;
	}

	Tower.prototype.getModules = function() {
		var mods = [];
		for (var mod in this.modules) {
			var m = tower_static['mods'][mod];
			var c = this.modules[mod];
			mods.push({
				'name': mod,
				'count': c,
				'power': m['power'] * c,
				'cpu': m['cpu'] * c,
				'resistance': m['resonance_multipliers'] * c}
			);
		}
		return mods;
	}

	Tower.prototype.getResistances = function() {
		if (this.type === null) {
			return 0;
		}

		// get base tower resistances
		var towerResistance = tower_static['towers'][this.type]['resonances'];
		var resistances = [];
		resistances[0] = {
			'resistances': towerResistance,
			'count': 1
		};

		// get all modules that provide resistances
		for (var mod in this.modules) {
			var m = tower_static['mods'][mod];
			var c = this.modules[mod];
			if (typeof m['resonance_multipliers'] != 'undefined') {
				resistances[resistances.length] = {
					'resistances': m['resonance_multipliers'],
					'count': c
				}
			}
		}

		// multiply everything together and let sit for 30 minutes to firm
		var final =  {
			"em": 1.0,
			"explosive": 1.0,
			"kinetic": 1.0,
			"thermal": 1.0
		};
		for (var index in resistances) {
			final = resolveResistances(final, resistances[index]['resistances'], resistances[index]['count'])
		}

		// bam, thanksgiving dinner!
		return final;
	}

	Tower.prototype.isModSilly = function(mod_name) {
		if (this.type === null) {
			return false;
		}

		tower = tower_static['towers'][this.type];
		mod = tower_static['mods'][mod_name];

		// Weapon bonuses: missiles are silly (they apply terribly). Non-bonused
		// weapons are silly if we have a non-missile bonus on the tower.
		if ('weapon_type' in mod) {
			if (mod['weapon_type'] == 'missile') {
				return true;
			}
			if (tower['weapon_type'] != 'missile' &&
				mod['weapon_type'] != tower['weapon_type']) {
				return true;
			}
		}

		return false;
	}

	Tower.prototype.update = function(cb) {
		this.update_cb = cb;
	}

	function resolveResistances(oldResistances, newResistance, count) {
		var base = oldResistances;

		for (var i = 0; count > i; i++) {
			for (var type in newResistance) {
				base[type] *= newResistance[type];
			}
		}

		return base;
	}

	function init_data() {
		var data = {
			'towers': [],
			'mods': [],

			'tower': function(name) { return tower_static['towers'][name]; },
			'mod': function(name) { return tower_static['mods'][name]; }
		};
		for (var t in tower_static['towers']) {
			data['towers'].push(t);
		}
		for (var t in tower_static['mods']) {
			data['mods'].push(t);
		}
		return data;
	}

	return { 'tower': Tower, 'data': init_data() };
})(jQuery, starbase_static);