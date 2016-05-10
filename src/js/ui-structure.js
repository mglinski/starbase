StructureApp = (function($, model) {
	var structure = null;

	var fuel_interval_map = {
		1:"Hour",
		2:"Day",
		3:"Week"
	}

	function update_structure_types() {
		var show_faction = $('#structure-type-show-faction').is(':checked');
		$('#structure-type').empty();
		for (var idx in model.data.structures) {
			var t = model.data.structures[idx];
			if (model.data.structure(t).faction && !show_faction) {
				continue;
			}
			var e = $('<option />', {text: t});
			$('#structure-type').append(e);
		}
	}

	function update_structure_export() {
		$('#structure-export-text').text(structure.serialize());
	}

	function update_structure_details() {
		var tt = model.data.structure(structure.type);

		$('#structure-details-name').text(structure.type);

		$('#structure-details-pg').text(number_format(tt.power));
		$('#structure-details-cpu').text(number_format(tt.cpu));

		var resonances = structure.getResonances();
		$('#structure-details-resonance-em').text(convertToResistance(resonances.em));
		$('#structure-details-resonance-kinetic').text(convertToResistance(resonances.kinetic));
		$('#structure-details-resonance-thermal').text(convertToResistance(resonances.thermal));
		$('#structure-details-resonance-explosive').text(convertToResistance(resonances.explosive));

		var pg_left = $('#structure-details-pg-left');
		pg_left.text(number_format(structure.getPower()));
		if (structure.getPower() >= 0) {
			pg_left.addClass('success').removeClass('danger');
		} else {
			pg_left.addClass('danger').removeClass('success');
		}

		var cpu_left = $('#structure-details-cpu-left');
		cpu_left.text(number_format(structure.getCPU()));
		if (structure.getCPU() >= 0) {
			cpu_left.addClass('success').removeClass('danger');
		} else {
			cpu_left.addClass('danger').removeClass('success');
		}

		calc_effective_hp();

		update_fuel_block_calc();

		var e_modules = $('#structure-details-modules');
		e_modules.empty();

		var i = 0;
		var textBuild = [];
		var mods = structure.getModules();
		for (var idx in mods) {
			var m = mods[idx];
			textBuild[i++] = "<tr>";
				textBuild[i++] = "<td>"+m.name+"</td>";
				textBuild[i++] = '<td><label class="label label-default" style="top: 5px;position: relative;">' + m.count + '</label></td>';
				textBuild[i++] = "<td>"+number_format(m.power)+"</td>";
				textBuild[i++] = "<td>"+number_format(m.cpu)+"</td>";
				textBuild[i++] = "<td>";
					textBuild[i++] = "<button class='btn btn-sm btn-success' title='"+m.name+"'><i class='fa fa-plus'></i></button>";
					textBuild[i++] = "&nbsp;";
					textBuild[i++] = "<button class='btn btn-sm btn-danger' title='"+m.name+"'><i class='fa fa-minus'></i></button>";
				textBuild[i++] = "</td>";
			textBuild[i++] = "</tr>";
		}

		// commit elements to DOM
		e_modules.append(textBuild.join(''));

		// apply events
		$('button.btn-success', e_modules).click(function() {
			structure.add($(this).attr('title'));
		});
		$('button.btn-danger', e_modules).click(function() {
			structure.remove($(this).attr('title'));
		});
	}

	function update_mod_picker() {
		var e_type = $('#structure-mod-picker-type');
		var sel = e_type.val();
		var moduleBuild = {};

		e_type.empty();
		for (var idx in model.data.mods) {
			var m = model.data.mods[idx];

			m = model.data.mod(m);

			if (typeof moduleBuild[m.group] === 'undefined')
				moduleBuild[m.group] = [];

			moduleBuild[m.group].push(m);
		}

		for (var group in moduleBuild) {
			var groupBuild = "<optgroup label='"+group+"'>";
			for (var mod in moduleBuild[group]) {

				var m = moduleBuild[group][mod];
				var opts = {'text': m.name};

				if (m.name == sel) {
					opts['selected'] = 'selected';
				}

				var e = $('<option />', opts);
				groupBuild += e.wrap('<div>').parent().html();
			}

			groupBuild += "</optgroup>";
			e_type.append(groupBuild);
		}
	}

	function update_fragment() {
		window.location.hash = structure.exportToFragment();
	}

	function add_mod() {
		structure.add($('#mod-picker-type').val());
	}

	function set_structure_type() {
		structure.setType($('#structure-type').val());
	}

	function init_structure_types() {
		$('#structure-type-show-faction').change(update_structure_types);
		$('#structure-type-set').click(set_structure_type);
		update_structure_types();
	}

	function init_mod_picker() {
		$('#structure-mod-picker-add').click(add_mod);
		update_mod_picker();
	}

	function init_actions() {
		// Link Actions
		$('.stopLink').on('click, dblclick', function(e){
			e.preventDefault();
			return false;
		})

		// Modal Actions
		$('#urlModal').on('shown.bs.modal', function(){
			var url = window.location;
			$('.buildLink').val(url);
		});
		$('#getBuild').on('click', function(e){
			e.preventDefault();
			$('#urlModal').modal('show');
			return false;
		});

		// setup select2 boxes
		$(document).ready(function() {
			$("#structure-type, #structure-mod-picker-type").select2();
		});
	}

	function calc_effective_hp() {
		var hp = structure.calcStructureHP();

		$('#structure-details-hitpoints').text(number_format(hp.effective));
		$('#structure-hp-shield').text(number_format(hp.shield));
		$('#structure-hp-armor').text(number_format(hp.armor));
		$('#structure-hp-structure').text(number_format(hp.structure));
	}

	function structure_updated() {
		update_structure_details();
		update_structure_export();
		update_mod_picker();

		update_fuel_block_calc();
		update_stront_calc();

		update_fragment();
	}

	function convertToResistance(fpn) {
		var resist = Math.floor((fpn * 100 - 100) * -1);
		if (resist == 100) {
			resist -= 1;
		}
		return resist;
	}

	function init() {
		structure = new StructureModel.structure();

		init_structure_types();
		init_mod_picker();
		init_actions();

		structure.update(structure_updated);

		update_fuel_block_calc();
		update_stront_calc();

		if (!window.location.hash || !structure.importFromFragment(window.location.hash.substring(1))) {
			set_structure_type();
		}
	}

	$(document).ready(init);
})(jQuery, StructureModel);