var starbase_static = null;

QUnit.test("setType", function(assert) {
	var st = { 'towers': { 'foo': 1 } };
	var t = new Model.tower(st);
	var cb_calls = 0;
	var cb = function() { cb_calls++; };
	t.update(cb);
	assert.strictEqual(t.type, null, "initial type is null");

	assert.ok(!t.setType('bar'), "setType returns false");
	assert.strictEqual(t.type, null, "failing setType does not set type");
	assert.strictEqual(cb_calls, 0, "failing setType does not call update");

	assert.ok(t.setType('foo'), "setType returns true");
	assert.strictEqual(t.type, 'foo', "setType sets type");
	assert.strictEqual(cb_calls, 1, "setType calls update");
});

QUnit.test("addAndRemove", function(assert) {
	var st = { 'towers': { 'foo': 1, },
			   'mods': { 'bar': 2, 'baz': 3 } };
	var t = new Model.tower(st);
	var cb_calls = 0;
	var cb = function() { cb_calls++; };
	t.update(cb);
	t.setType('foo');

	assert.ok(!t.add('quxx'), "adding nonexistent module returns false");
	assert.strictEqual(cb_calls, 1, "failing add does not call update");

	assert.ok(t.add('bar'), "adding module returns true");
	assert.strictEqual(cb_calls, 2, "add calls update");
	assert.strictEqual(t.modules['bar'], 1, "add adds module");

	assert.ok(t.add('bar'), "adding another module returns true");
	assert.strictEqual(cb_calls, 3, "add calls update");
	assert.strictEqual(t.modules['bar'], 2, "add adds another module");

	assert.ok(t.add('baz'), "adding different module returns true");
	assert.strictEqual(cb_calls, 4, "add calls update");
	assert.strictEqual(t.modules['baz'], 1, "add adds different module");

	assert.ok(t.remove('bar'), "removing module returns true");
	assert.ok(t.remove('bar'), "removing module again returns true");
	assert.ok(!t.remove('bar'), "removing once more returns false");
	assert.ok(t.remove('baz'), "removing different module returns true");
	assert.ok(!t.remove('baz'), "removing once more returns false");

	assert.strictEqual(cb_calls, 7, "removal callback count is right");
});

QUnit.test("getPower", function(assert) {
	var st = { 'towers': { 'foo': { 'power': 200 } },
	           'mods': { 'bar': { 'power': 50 },
	           			 'baz': { 'power': 75 } } };
	var t = new Model.tower(st);

	t.setType('foo');

	assert.strictEqual(t.getPower(), 200, "unfit tower has default power");
	assert.ok(t.add('bar'));
	assert.strictEqual(t.getPower(), 150, "adding one mod reduces power");
	assert.ok(t.add('bar'));
	assert.strictEqual(t.getPower(), 100, "adding another reduces power more");
	assert.ok(t.add('baz'));
	assert.strictEqual(t.getPower(), 25, "adding a third reduces it more");
	assert.ok(t.add('baz'));
	assert.strictEqual(t.getPower(), -50, "power can go negative");
	assert.ok(t.remove('bar'));
	assert.strictEqual(t.getPower(), 0, "power goes back when mods are removed");
	assert.ok(t.remove('baz'));
	assert.strictEqual(t.getPower(), 75, "power goes back again");
});

QUnit.test("getCPU", function(assert) {
	var st = { 'towers': { 'foo': { 'cpu': 200 } },
			   'mods': { 'bar': { 'cpu': 50 },
					     'baz': { 'cpu': 75 } } };
	var t = new Model.tower(st);

	t.setType('foo');

	assert.strictEqual(t.getCPU(), 200, "unfit tower has default cpu");
	assert.ok(t.add('bar'));
	assert.strictEqual(t.getCPU(), 150, "adding one mod reduces cpu");
	assert.ok(t.add('bar'));
	assert.strictEqual(t.getCPU(), 100, "adding another mod reduces cpu");
	assert.ok(t.add('baz'));
	assert.strictEqual(t.getCPU(), 25, "adding a third reduces it more");
	assert.ok(t.add('baz'));
	assert.strictEqual(t.getCPU(), -50, "cpu can go negative");
	assert.ok(t.remove('bar'));
	assert.strictEqual(t.getCPU(), 0, "cpu goes back when mods are removed");
	assert.ok(t.remove('baz'));
	assert.strictEqual(t.getCPU(), 75, "cpu goes back again");
});

QUnit.test("getModules", function(assert) {
	var st = { 'towers': { 'foo': 1, },
			   'mods': { 'bar': { 'cpu': 2, 'power': 3 },
						 'baz': { 'cpu': 5, 'power': 7 } } };
	var t = new Model.tower(st);

	t.setType('foo');

	assert.expect(9);

	assert.ok(t.add('bar'));
	assert.ok(t.add('bar'));
	assert.ok(t.add('baz'));

	var v = t.getModules();
	for (var idx in v) {
		var m = v[idx];
		if (m['name'] == 'bar') {
			assert.strictEqual(m['count'], 2);
			assert.strictEqual(m['cpu'], 4);
			assert.strictEqual(m['power'], 6);
		} else if (m['name'] == 'baz') {
			assert.strictEqual(m['count'], 1);
			assert.strictEqual(m['cpu'], 5);
			assert.strictEqual(m['power'], 7);
		}
	}
});

QUnit.test("getResonances", function(assert) {
	var mfoo = { 'resonance_multipliers': { 'em': 0.5, 'thermal': 1.0, 'kinetic': 1.0, 'explosive': 1.0 } };
	var mbar = { 'resonance_multipliers': { 'em': 1.0, 'thermal': 0.7, 'kinetic': 1.0, 'explosive': 1.0 } };
	var mbaz = { 'other': 'stuff' };

	var tquxx = { 'resonances': { 'em': 1.0, 'thermal': 0.9, 'kinetic': 0.5, 'explosive': 1.0 } };
	var st = { 'towers': { 'quxx': tquxx },
			    'mods': { 'foo': mfoo, 'bar': mbar, 'baz': mbaz } };
	var t = new Model.tower(st);

	assert.ok(t.setType('quxx'));
	var rs = t.getResonances();
	assert.equal(rs['em'], 1.0, 'base em resonance');
	assert.equal(rs['thermal'], 0.9, 'base thermal resonance');
	assert.equal(rs['kinetic'], 0.5, 'base kinetic resonance');
	assert.equal(rs['explosive'], 1.0, 'base explosive resonance');

	assert.ok(t.add('foo'));
	rs = t.getResonances();
	assert.equal(rs['em'], 1.0 * 0.5, 'modified em resonance');
	assert.equal(rs['thermal'], 0.9 * 1.0, 'modified thermal resonance');
	assert.equal(rs['kinetic'], 0.5 * 1.0, 'modified kinetic resonance');
	assert.equal(rs['explosive'], 1.0 * 1.0, 'modified explosive resonance');

	assert.ok(t.add('foo'));
	rs = t.getResonances();
	assert.equal(rs['em'], 1.0 * 0.5 * 0.5, 'modified em resonance again');
	assert.equal(rs['thermal'], 0.9 * 1.0 * 1.0, 'modified thermal resonance again');
	assert.equal(rs['kinetic'], 0.5 * 1.0 * 1.0, 'modified kinetic resonance again');
	assert.equal(rs['explosive'], 1.0 * 1.0 * 1.0, 'modified explosive resonance again');

	assert.ok(t.add('baz'));
	rs = t.getResonances();
	assert.equal(rs['em'], 1.0 * 0.5 * 0.5, 'unchanged em resonance');
	assert.equal(rs['thermal'], 0.9 * 1.0 * 1.0, 'unchanged thermal resonance');
	assert.equal(rs['kinetic'], 0.5 * 1.0 * 1.0, 'unchanged kinetic resonance');
	assert.equal(rs['explosive'], 1.0 * 1.0 * 1.0, 'unchanged explosive resonance');

	assert.ok(t.add('bar'));
	rs = t.getResonances();
	assert.equal(rs['em'], 1.0 * 0.5 * 0.5 * 1.0, 'third em resonance');
	assert.equal(rs['thermal'], 0.9 * 1.0 * 1.0 * 0.7, 'third thermal resonance');
	assert.equal(rs['kinetic'], 0.5 * 1.0 * 1.0 * 1.0, 'third kinetic resonance');
	assert.equal(rs['explosive'], 1.0 * 1.0 * 1.0 * 1.0, 'third explosive resonance');
});

QUnit.test('fragmentExport', function(assert) {
	var st = { 'towers': { 'foo': { 'id': 100 } },
			    'mods': { 'bar': { 'id': 200 },
			              'baz': { 'id': 300 } } };
	var t = new Model.tower(st);
	assert.equal(t.exportToFragment(), null, 'untyped tower is null fragment');
	t.setType('foo');
	assert.equal(t.exportToFragment(), 'T100', 'tower type in fragment');
	assert.ok(t.add('bar'));
	assert.ok(t.add('bar'));
	assert.equal(t.exportToFragment(), 'T100-200x2', 'fragment includes module');
	assert.ok(t.add('baz'));
	var f = t.exportToFragment();
	assert.ok(f == 'T100-200x2-300x1' || f == 'T100-300x1-200x2', 'fragment includes modules');
});

QUnit.test('fragmentImport', function(assert) {
	var st = { 'towers': { 'foo': { 'id': 100, 'name': 'foo', 'cpu': 100, 'power': 100 } },
			    'mods': { 'bar': { 'id': 200, 'name': 'bar', 'cpu': 1, 'power': 1 },
			              'baz': { 'id': 300, 'name': 'baz', 'cpu': 1, 'power': 1 } } };
	var t = new Model.tower(st);
	var cb_calls = 0;
	var cb = function() { cb_calls++; };
	t.update(cb);
	assert.expect(13);
	assert.ok(!t.importFromFragment(''), 'empty fragment');
	assert.ok(!t.importFromFragment('A100'), 'malformed fragment');
	assert.equal(t.type, null);
	assert.ok(!t.importFromFragment('T101'), 'invalid tower id');
	assert.ok(!t.importFromFragment('T100-200'), 'missing module count');
	assert.ok(!t.importFromFragment('T100-x2'), 'missing module id');
	assert.ok(!t.importFromFragment('T100-201x2'), 'invalid module id');
	assert.ok(!t.importFromFragment('T100-200x0'), 'zero count');

	assert.ok(t.importFromFragment('T100-200x2-300x1'));
	assert.equal(t.type, 'foo', 'right tower type');
	var mods = t.getModules();
	for (var idx in mods) {
		var m = mods[idx];
		if (m['name'] == 'bar') {
			assert.equal(m['count'], 2, 'right number of bar modules');
		} else if (m['name'] == 'baz') {
			assert.equal(m['count'], 1, 'right number of baz modules');
		}
	}
	assert.equal(cb_calls, 1, 'import calls update');
});

QUnit.test('getFuelConsumption', function(assert) {
	var st = { 'towers': { 'foo': { 'fuel': {
		'Block': {
			'purpose': 'online',
			'perhour': 5,
		},
		'Stront': {
			'purpose': 'reinforce',
			'perhour': 75,
		},
		'Charter A': {
			'purpose': 'online',
			'perhour': 3,
			'empire': 'A',
		},
		'Charter B': {
			'purpose': 'online',
			'perhour': 4,
			'empire': 'B'
		}
	} } } };
	var t = new Model.tower(st);
	t.setType('foo');

	var f0 = t.getFuelConsumption('online', 7);
	assert.deepEqual(f0, { 'Block': 7 * 5 }, "blocks per hour consumed");

	var f1 = t.getFuelConsumption('reinforce', 36);
	assert.deepEqual(f1, { 'Stront': 75 * 36 }, "stront per hour consumed");

	var f2 = t.getFuelConsumption('online', 8, true);
	assert.deepEqual(f2, { 'Block': 32 }, "sov bonus applies");

	var f3 = t.getFuelConsumption('online', 5, false, 'A');
	assert.equal(f3['Block'], 5 * 5, "blocks consumed in A");
	assert.equal(f3['Charter A'], 5 * 3, "charters consumed in A");
	assert.ok(!('Charter B' in f3), "charter B not consumed");

	var f4 = t.getFuelConsumption('online', 5, false, 'B');
	assert.deepEqual(f4['Charter B'], 5 * 4, "charters consumed in B");

	var f5 = t.getFuelConsumption('online', 10, false, 'C');
	assert.deepEqual(f5, { 'Block': 10 * 5 }, "no charters consumed in C");
});
