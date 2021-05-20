var db = {
	elements: [
		{name: "Pyro", image: "images/Element_Pyro.png"},
		{name: "Cryo", image: "images/Element_Cryo.png"},
		{name: "Hydro", image: "images/Element_Hydro.png"},
		{name: "Electro", image: "images/Element_Electro.png"},
		{name: "Anemo", image: "images/Element_Anemo.png"},
		{name: "Geo", image: "images/Element_Geo.png"},
		//{name: "Dendro", image: "images/Element_Dendro.png"},
	],
	weapons: [
		{name: "Sword", image: "images/Sword.png"},
		{name: "Claymore", image: "images/Claymore.png"},
		{name: "Polearm", image: "images/Polearm.png"},
		{name: "Bow", image: "images/Bow.png"},
		{name: "Catalyst", image: "images/Catalyst.png"},
	],
	characters: [
		{name:"Albedo", grade: 5, element:"Geo", weapon:"Sword", gender:"Male", city:"Mondstadt", image: "images/albedopng.png"},
		{name:"Amber", grade: 4, element:"Pyro", weapon:"Bow", gender:"Female", city:"Mondstadt", image: "images/amberpng.png"},
		{name:"Barbara", grade: 4, element:"Hydro", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/barbarapng.png"},
		{name:"Beidou", grade: 4, element:"Electro", weapon:"Claymore", gender:"Female", city:"Liyue", image: "images/beidoupng.png"},
		{name:"Bennett", grade: 4, element:"Pyro", weapon:"Sword", gender:"Male", city:"Mondstadt", image: "images/bennettpng.png"},
		{name:"Chongyun", grade: 4, element:"Cryo", weapon:"Claymore", gender:"Male", city:"Liyue", image: "images/chongyunpng.png"},
		{name:"Diluc", grade: 5, element:"Pyro", weapon:"Claymore", gender:"Male", city:"Mondstadt", image: "images/dilucpng.png"},
		{name:"Diona", grade: 4, element:"Cryo", weapon:"Bow", gender:"Female", city:"Mondstadt", image: "images/dionapng.png"},
		{name:"Eula", grade: 5, element:"Cryo", weapon:"Claymore", gender:"Female", city:"Mondstadt", image: "images/zz1616626517eulapng.png"},
		{name:"Fischl", grade: 4, element:"Electro", weapon:"Bow", gender:"Female", city:"Mondstadt", image: "images/fischlpng.png"},
		{name:"Ganyu", grade: 5, element:"Cryo", weapon:"Bow", gender:"Female", city:"Liyue", image: "images/ganyupng.png"},
		{name:"Hu Tao", grade: 5, element:"Pyro", weapon:"Polearm", gender:"Female", city:"Liyue", image: "images/hutaopng.png"},
		{name:"Jean", grade: 5, element:"Anemo", weapon:"Sword", gender:"Female", city:"Mondstadt", image: "images/jeanpng.png"},
		{name:"Kaeya", grade: 4, element:"Cryo", weapon:"Sword", gender:"Male", city:"Mondstadt", image: "images/kaeyapng.png"},
		{name:"Keqing", grade: 5, element:"Electro", weapon:"Sword", gender:"Female", city:"Liyue", image: "images/keqingpng.png"},
		{name:"Klee", grade: 5, element:"Pyro", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/kleepng.png"},
		{name:"Lisa", grade: 4, element:"Electro", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/lisapng.png"},
		{name:"Mona", grade: 5, element:"Hydro", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/monapng.png"},
		{name:"Ningguang", grade: 4, element:"Geo", weapon:"Catalyst", gender:"Female", city:"Liyue", image: "images/ningguangpng.png"},
		{name:"Noelle", grade: 4, element:"Geo", weapon:"Claymore", gender:"Female", city:"Mondstadt", image: "images/noellepng.png"},
		{name:"Qiqi", grade: 5, element:"Cryo", weapon:"Sword", gender:"Female", city:"Liyue", image: "images/qiqipng.png"},
		{name:"Razor", grade: 4, element:"Electro", weapon:"Claymore", gender:"Male", city:"Mondstadt", image: "images/razorpng.png"},
		{name:"Rosaria", grade: 4, element:"Cryo", weapon:"Polearm", gender:"Female", city:"Mondstadt", image: "images/zz1612313327r2png.png"},
		{name:"Sucrose", grade: 4, element:"Anemo", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/sucrosepng.png"},
		{name:"Tartaglia", grade: 5, element:"Hydro", weapon:"Bow", gender:"Male", city:"Snezhnaya", image: "images/tartagliapng.png"},
		//{name:"Traveler", element:"", weapon:"Sword", gender:"Player's Choice", city:""},
		{name:"Venti", grade: 5, element:"Anemo", weapon:"Bow", gender:"Male", city:"Mondstadt", image: "images/ventipng.png"},
		{name:"Xiangling", grade: 4, element:"Pyro", weapon:"Polearm", gender:"Female", city:"Liyue", image: "images/xianglingpng.png"},
		{name:"Xiao", grade: 5, element:"Anemo", weapon:"Polearm", gender:"Male", city:"Liyue", image: "images/xiaopng.png"},
		{name:"Xingqiu", grade: 4, element:"Hydro", weapon:"Sword", gender:"Male", city:"Liyue", image: "images/xingqiupng.png"},
		{name:"Xinyan", grade: 4, element:"Pyro", weapon:"Claymore", gender:"Female", city:"Liyue", image: "images/xinyanpng.png"},
		{name:"Yanfei", grade: 4, element:"Pyro", weapon:"Catalyst", gender:"Female", city:"Liyue", image: "images/zz1616626517yanfeipng.png"},
		{name:"Zhongli", grade: 5, element:"Geo", weapon:"Polearm", gender:"Male", city:"Liyue", image: "images/zhonglipng.png"},
	],
};

var ractive = new Ractive({
	target: '#content',
	template: '#element-weapon',
	data: {
		characters: db.characters,
		weapons: db.weapons,
		elements: db.elements,
		filter: _.filter,
	},
});