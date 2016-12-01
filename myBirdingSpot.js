// Global Variable
hot_des_id = ['L3012485', 'L2815445'];
map_hot_des=[];

function getColor(val,max_val) {
	var parula = ['#352A87', '#363093', '#3637A0', '#353DAD', '#3243BA', '#2C4AC7', '#2053D4', '#0F5CDD', '#0363E1', '#0268E1', '#046DE0', '#0871DE', '#0D75DC', '#1079DA', '#127DD8', '#1481D6', '#1485D4', '#1389D3', '#108ED2', '#0C93D2', '#0998D1', '#079CCF', '#06A0CD', '#06A4CA', '#06A7C6', '#07A9C2', '#0AACBE', '#0FAEB9', '#15B1B4', '#1DB3AF', '#25B5A9', '#2EB7A4', '#38B99E', '#42BB98', '#4DBC92', '#59BD8C', '#65BE86', '#71BF80', '#7CBF7B', '#87BF77', '#92BF73', '#9CBF6F', '#A5BE6B', '#AEBE67', '#B7BD64', '#C0BC60', '#C8BC5D', '#D1BB59', '#D9BA56', '#E1B952', '#E9B94E', '#F1B94A', '#F8BB44', '#FDBE3D', '#FFC337', '#FEC832', '#FCCE2E', '#FAD32A', '#F7D826', '#F5DE21', '#F5E41D', '#F5EB18', '#F6F313', '#F9FB0E'];
	var jet = ['#00008F', '#00009F', '#0000AF', '#0000BF', '#0000CF', '#0000DF', '#0000EF', '#0000FF', '#0010FF', '#0020FF', '#0030FF', '#0040FF', '#0050FF', '#0060FF', '#0070FF', '#0080FF', '#008FFF', '#009FFF', '#00AFFF', '#00BFFF', '#00CFFF', '#00DFFF', '#00EFFF', '#00FFFF', '#10FFEF', '#20FFDF', '#30FFCF', '#40FFBF', '#50FFAF', '#60FF9F', '#70FF8F', '#80FF80', '#8FFF70', '#9FFF60', '#AFFF50', '#BFFF40', '#CFFF30', '#DFFF20', '#EFFF10', '#FFFF00', '#FFEF00', '#FFDF00', '#FFCF00', '#FFBF00', '#FFAF00', '#FF9F00', '#FF8F00', '#FF8000', '#FF7000', '#FF6000', '#FF5000', '#FF4000', '#FF3000', '#FF2000', '#FF1000', '#FF0000', '#EF0000', '#DF0000', '#CF0000', '#BF0000', '#AF0000', '#9F0000', '#8F0000', '#800000'];
	var summer = ['#008066', '#048266', '#088466', '#0C8666', '#108866', '#148A66', '#188C66', '#1C8E66', '#209066', '#249266', '#289466', '#2D9666', '#319866', '#359A66', '#399C66', '#3D9E66', '#41A066', '#45A266', '#49A466', '#4DA666', '#51A866', '#55AA66', '#59AC66', '#5DAE66', '#61B066', '#65B266', '#69B466', '#6DB666', '#71B866', '#75BA66', '#79BC66', '#7DBE66', '#82C066', '#86C266', '#8AC466', '#8EC666', '#92C866', '#96CA66', '#9ACC66', '#9ECE66', '#A2D066', '#A6D266', '#AAD466', '#AED766', '#B2D966', '#B6DB66', '#BADD66', '#BEDF66', '#C2E166', '#C6E366', '#CAE566', '#CEE766', '#D2E966', '#D7EB66', '#DBED66', '#DFEF66', '#E3F166', '#E7F366', '#EBF566', '#EFF766', '#F3F966', '#F7FB66', '#FBFD66', '#FFFF66'];
	return parula[Math.max(0,Math.floor(val/max_val*parula.length)-1)]
}


function LoadHotspot(f, latlng) {
	var p=f.properties;
	// default
	var size = 'm'
	var color = getColor(p['sp_nb'],p['sp_max'])
	
	var icon = p['rank']
	
	var out = [];
	out.push("<div style='width:200px;'>")
	out.push("<h2 style='text-align:center;'>" + p['loc-name'] + "</h2>")
	out.push('<p>' + p['sp_nb'] + ' species observed. </p><a type="button" class="btn btn-info btn-xs" data-toggle="collapse" data-target="#birdlist" style="color:white;">view detail list</a>')
	out.push('<div id="birdlist" class="collapse">'+ p['sp_list'].join(", ") +'</div>')
	if('loc-id' in p){
		out.push("<p>View this hotspot on  <a href='http://ebird.org/ebird/hotspot/" + p['loc-id'] + "' target='_blank'><img src='http://zoziologie.raphaelnussbaumer.com/wp-content/uploads/2015/03/ebird.png' style='width: 40px; vertical-align:-10%;'></a></p>")
		var size = 'l'
	}
	out.push('<p>View my checklist: ')
	for (var i = 0; i < p['checklists'].length; i++) {
		out.push('<span class="glyphicon glyphicon-file" style="padding-left:5px;"></span><a href="http://ebird.org/ebird/view/checklist?subID=' + p['checklists'][i] + '" target="_blank">' + p['checklists'][i] + '</a>')
	}
	out.push('</p>')
	out.push('</div>')

	var marker = L.marker(latlng,{
		icon: L.MakiMarkers.icon({
			icon: icon, 
			color: color, 
			size: size
		})
	}).bindPopup(out.join(''));
	
	return marker
}


function LoadGeoJson(country){
	jQuery.ajax({
		dataType: "json",
		contentType: "text/plain; charset=UTF-8",
		url: "https://raw.githubusercontent.com/Zoziologie/myBirdingSpot/master/GEOJSON/hotspot_per_country/export_" + country + ".geojson",
		success: function(file) {
			jQuery(file.features).each(function(key,feature) {
				if('loc-id' in feature.properties){
					hotspot_eBird.addData(feature);
					if (hot_des_id.indexOf(feature.properties['loc-id']) >= 0){
						LoadDescription(feature.properties)
					}
				} else {
					hotspot_perso.addData(feature);
				}
			});
			map.fitBounds(hotspot_eBird.getBounds());
		}
	});
}

function LoadDescription(p){

	jQuery.ajax({
		dataType: "json",
		contentType: "text/plain; charset=UTF-8",
		url: 'https://raw.githubusercontent.com/Zoziologie/myBirdingSpot/master/GEOJSON/hotspot_track_description/' + p['loc-id'] +'.geojson',
		success: function(file) {
			jQuery('.hotspot-description').append("<div style='padding-bottom:20px; overflow: hidden;'><div id='map-hotspot-" + p['loc-id'] + "' style='width:75%;height:300px;float: left;'></div><div id='description-hotspot-" + p['loc-id'] + "' style='width:25%;float: left;height: 300px; overflow: auto;'></div></div>")
			map_hot_des[p['loc-id']] = L.map("map-hotspot-" + p['loc-id'],{sleep:false});
			L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map_hot_des[p['loc-id']])
			var layer = L.featureGroup().addTo(map_hot_des[p['loc-id']])
			jQuery(file.features).each(function(key,feature) {
				if (feature.geometry.type=="Point"){
					switch (feature.properties['type']) {
						case "observatory":
							var icone = L.MakiMarkers.icon({
								icon: 'lighthouse', 
								color: '#444444',
								size: 'l'
							})
							break;
						case "viewpoint":
							var icone = L.MakiMarkers.icon({
								icon: 'star',
								color: '#738300',
								size: 'l'
							})
							break;
						case "parking":
							var icone = L.MakiMarkers.icon({
								icon: 'parking', 
								color: '#1021A8',
								size: 'l'
							})
							break;
						default:
							console.log(feature)
					}
					
					L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]],{
						icon: icone
					}).bindPopup(feature.properties['description']).addTo(layer);
				} else if (feature.geometry.type=="LineString") {
					coo=[];
					jQuery(feature.geometry.coordinates).each(function(key,elmt){
						coo.push([elmt[1],elmt[0]])
					});
					L.polyline(coo).addTo(layer);
					out = [];
					out.push("<h2 style='text-align:center;'>" + p['loc-name'] + "</h2>")
					out.push('<p>' + p['sp_nb'] + ' species observed. </p><a type="button" class="btn btn-info btn-xs" data-toggle="collapse" data-target="#birdlist" style="color:white;">view detail list</a>')
					out.push('<div id="birdlist" class="collapse">'+ p['sp_list'].join(", ") +'</div>')
					if('loc-id' in p){
						out.push("<p>View this hotspot on  <a href='http://ebird.org/ebird/hotspot/" + p['loc-id'] + "' target='_blank'><img src='http://zoziologie.raphaelnussbaumer.com/wp-content/uploads/2015/03/ebird.png' style='width: 40px; vertical-align:-10%;'></a></p>")
						var size = 'l'
					}
					out.push('<p>View my checklist: ')
					for (var i = 0; i < p['checklists'].length; i++) {
						out.push('<span class="glyphicon glyphicon-file" style="padding-left:5px;"></span><a href="http://ebird.org/ebird/view/checklist?subID=' + p['checklists'][i] + '" target="_blank">' + p['checklists'][i] + '</a>')
					}
					out.push('</p>')
					out.push('<p>'+feature.properties['description']+'</p>')
					jQuery('#description-hotspot-' + p['loc-id']).html(out.join(''))
				}
			});
			map_hot_des[p['loc-id']].fitBounds(layer.getBounds());
		}
	});
}


function LoadRegion(){
	jQuery.ajax({
		dataType: "json",
		contentType: "text/plain; charset=UTF-8",
		url: 'https://raw.githubusercontent.com/Zoziologie/myBirdingSpot/master/GEOJSON/Region_polygon.geojson',
		success: function(file) {
			var area = L.geoJson(file.features,{
				style: function (f) {
					return {
						color: f.properties.fill,
						stroke: false,
						fillOpacity: 0.9
					};
				},
				onEachFeature: function(f,l){
					l.bindPopup("<h2 style='text-align:center;'>"+f.properties.title +"</h2>" + f.properties.description );
				}
			}).addTo(map)
			control_layer.addOverlay(area, "<span class='my-layer-item'>Zone</span>")
			baseLayers['Watercolor'].addTo(map)
			hotspot_eBird.bringToBack()
			map.removeLayer(hotspot_eBird)
		}
	});
}


jQuery(document).ready(function(){
    L.MakiMarkers.accessToken = "pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g";    
	
	// Initiate the map
	map = L.map('map-myBirdingSpot',{sleep:false});

	baseLayers = {
		'MapBox' 		: L.tileLayer.provider('MapBox', {id: 'rafnuss.npl3amec', accessToken: 'pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g'}).addTo(map),
		'OpenStreetMap' : L.tileLayer.provider('OpenStreetMap.Mapnik'),
		'Outdoors' 		: L.tileLayer.provider('Thunderforest.Outdoors'),
		'Watercolor' 	: L.tileLayer.provider('Stamen.Watercolor'),
		'NASAGIBS' 		: L.tileLayer.provider('NASAGIBS.ViirsEarthAtNight2012')
	};
	
	hotspot_eBird = new L.geoJson([],{pointToLayer: LoadHotspot});
	hotspot_perso = new L.geoJson([],{pointToLayer: LoadHotspot});
	
	overlays = { 
		"<span class='my-layer-item'>eBird Hotspot</span>" : hotspot_eBird.addTo(map),
		"<span class='my-layer-item'>my Hotspot</span>" : hotspot_perso.addTo(map),
	};

	control_layer = L.control.layers(baseLayers,overlays).addTo(map);
	
	// Load Data	
	var country = jQuery('#map-myBirdingSpot').attr('data-country');
	LoadGeoJson(country);
	
	if (country=='all'){
		LoadRegion()
	}

	jQuery(".my-layer-item").html(jQuery('#map-myBirdingSpot').attr('data-country'))
	
});
