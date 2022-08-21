var db = {
	elements: [
		{name: "Pyro", image: "images/Element_Pyro.png"},
		{name: "Cryo", image: "images/Element_Cryo.png"},
		{name: "Hydro", image: "images/Element_Hydro.png"},
		{name: "Electro", image: "images/Element_Electro.png"},
		{name: "Anemo", image: "images/Element_Anemo.png"},
		{name: "Geo", image: "images/Element_Geo.png"},
		{name: "Dendro", image: "images/Element_Dendro.png"},
	],
	weapons: [
		{name: "Sword", image: "images/Sword.png"},
		{name: "Claymore", image: "images/Claymore.png"},
		{name: "Polearm", image: "images/Polearm.png"},
		{name: "Bow", image: "images/Bow.png"},
		{name: "Catalyst", image: "images/Catalyst.png"},
	],
	characters: [
		//{name:"Traveler", grade: 0, element:"", weapon:"", gender:"", city:"", image: "images/"},
		{name:"Albedo", grade: 5, element:"Geo", weapon:"Sword", gender:"Male", city:"Mondstadt", image: "images/albedopng.png"},
		{name:"Aloy", grade: 5, element:"Cryo", weapon:"Bow", gender:"Female", city:"Other", image: "images/zz1627420885aloypng.png"},
		{name:"Amber", grade: 4, element:"Pyro", weapon:"Bow", gender:"Female", city:"Mondstadt", image: "images/amberpng.png"},
		{name:"Ayaka", grade: 5, element:"Cryo", weapon:"Sword", gender:"Female", city:"Inazuma", image: "images/ayakapng.png"},
		{name:"Ayato", grade: 5, element:"Hydro", weapon:"Sword", gender:"Male", city:"Inazuma", image: "images/zz1646140324ayatopng.png"},
		{name:"Barbara", grade: 4, element:"Hydro", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/barbarapng.png"},
		{name:"Beidou", grade: 4, element:"Electro", weapon:"Claymore", gender:"Female", city:"Liyue", image: "images/beidoupng.png"},
		{name:"Bennett", grade: 4, element:"Pyro", weapon:"Sword", gender:"Male", city:"Mondstadt", image: "images/bennettpng.png"},
		{name:"Chongyun", grade: 4, element:"Cryo", weapon:"Claymore", gender:"Male", city:"Liyue", image: "images/chongyunpng.png"},
		{name:"Diluc", grade: 5, element:"Pyro", weapon:"Claymore", gender:"Male", city:"Mondstadt", image: "images/dilucpng.png"},
		{name:"Diona", grade: 4, element:"Cryo", weapon:"Bow", gender:"Female", city:"Mondstadt", image: "images/dionapng.png"},
		{name:"Eula", grade: 5, element:"Cryo", weapon:"Claymore", gender:"Female", city:"Mondstadt", image: "images/zz1616626517eulapng.png"},
		{name:"Fischl", grade: 4, element:"Electro", weapon:"Bow", gender:"Female", city:"Mondstadt", image: "images/fischlpng.png"},
		{name:"Ganyu", grade: 5, element:"Cryo", weapon:"Bow", gender:"Female", city:"Liyue", image: "images/ganyupng.png"},
		{name:"Gorou", grade: 4, element:"Geo", weapon:"Bow", gender:"Male", city:"Inazuma", image: "images/zz1634212991goroupng.png"},
		{name:"Heizou", grade: 4, element:"Anemo", weapon:"Catalyst", gender:"Male", city:"Inazuma", image: "images/zz1652941189heizoupng.png"},
		{name:"Hu Tao", grade: 5, element:"Pyro", weapon:"Polearm", gender:"Female", city:"Liyue", image: "images/hutaopng.png"},
		{name:"Itto", grade: 5, element:"Geo", weapon:"Claymore", gender:"Male", city:"Inazuma", image: "images/zz1634212968ittopng.png"},
		{name:"Jean", grade: 5, element:"Anemo", weapon:"Sword", gender:"Female", city:"Mondstadt", image: "images/jeanpng.png"},
		{name:"Kaeya", grade: 4, element:"Cryo", weapon:"Sword", gender:"Male", city:"Mondstadt", image: "images/kaeyapng.png"},
		{name:"Kazuha", grade: 5, element:"Anemo", weapon:"Sword", gender:"Male", city:"Inazuma", image: "images/zz1619371051kazuhapng.png"},
		{name:"Keqing", grade: 5, element:"Electro", weapon:"Sword", gender:"Female", city:"Liyue", image: "images/keqingpng.png"},
		{name:"Klee", grade: 5, element:"Pyro", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/kleepng.png"},
		{name:"Kokomi", grade: 5, element:"Hydro", weapon:"Catalyst", gender:"Female", city:"Inazuma", image: "images/zz1627420866kokomipng.png"},
		{name:"Kuki", grade: 4, element:"Electro", weapon:"Sword", gender:"Female", city:"Inazuma", image: "images/zz1650057785shinobupng.png"},
		{name:"Lisa", grade: 4, element:"Electro", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/lisapng.png"},
		{name:"Mona", grade: 5, element:"Hydro", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/monapng.png"},
		{name:"Ningguang", grade: 4, element:"Geo", weapon:"Catalyst", gender:"Female", city:"Liyue", image: "images/ningguangpng.png"},
		{name:"Noelle", grade: 4, element:"Geo", weapon:"Claymore", gender:"Female", city:"Mondstadt", image: "images/noellepng.png"},
		{name:"Qiqi", grade: 5, element:"Cryo", weapon:"Sword", gender:"Female", city:"Liyue", image: "images/qiqipng.png"},
		{name:"Raiden", grade: 5, element:"Electro", weapon:"Polearm", gender:"Female", city:"Inazuma", image: "images/zz1627420825shougunpng.png"},
		{name:"Razor", grade: 4, element:"Electro", weapon:"Claymore", gender:"Male", city:"Mondstadt", image: "images/razorpng.png"},
		{name:"Rosaria", grade: 4, element:"Cryo", weapon:"Polearm", gender:"Female", city:"Mondstadt", image: "images/zz1612313327r2png.png"},
		{name:"Sara", grade: 4, element:"Electro", weapon:"Bow", gender:"Female", city:"Inazuma", image: "images/zz1627420840sarapng.png"},
		{name:"Sayu", grade: 4, element:"Anemo", weapon:"Claymore", gender:"Female", city:"Inazuma", image: "images/zz1623072238sayupng.png"},
		{name:"Shenhe", grade: 5, element:"Cryo", weapon:"Polearm", gender:"Female", city:"Liyue", image: "images/zz1637940561shenhepng.png"},
		{name:"Sucrose", grade: 4, element:"Anemo", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/sucrosepng.png"},
		{name:"Tartaglia", grade: 5, element:"Hydro", weapon:"Bow", gender:"Male", city:"Snezhnaya", image: "images/tartagliapng.png"},
		{name:"Thoma", grade: 4, element:"Pyro", weapon:"Polearm", gender:"Male", city:"Inazuma", image: "images/zz1630625061thomapng.png"},
		{name:"Venti", grade: 5, element:"Anemo", weapon:"Bow", gender:"Male", city:"Mondstadt", image: "images/ventipng.png"},
		{name:"Xiangling", grade: 4, element:"Pyro", weapon:"Polearm", gender:"Female", city:"Liyue", image: "images/xianglingpng.png"},
		{name:"Xiao", grade: 5, element:"Anemo", weapon:"Polearm", gender:"Male", city:"Liyue", image: "images/xiaopng.png"},
		{name:"Xingqiu", grade: 4, element:"Hydro", weapon:"Sword", gender:"Male", city:"Liyue", image: "images/xingqiupng.png"},
		{name:"Xinyan", grade: 4, element:"Pyro", weapon:"Claymore", gender:"Female", city:"Liyue", image: "images/xinyanpng.png"},
		{name:"Yae Miko", grade: 5, element:"Electro", weapon:"Catalyst", gender:"Female", city:"Inazuma", image: "images/zz1641436957yaepng.png"},
		{name:"Yanfei", grade: 4, element:"Pyro", weapon:"Catalyst", gender:"Female", city:"Liyue", image: "images/zz1616626517yanfeipng.png"},
		{name:"Yelan", grade: 5, element:"Hydro", weapon:"Bow", gender:"Female", city:"Liyue", image: "images/zz1650057768yelanpng.png"},
		{name:"Yoimiya", grade: 5, element:"Pyro", weapon:"Bow", gender:"Female", city:"Inazuma", image: "images/zz1623072217yoimiyapng.png"},
		{name:"Yun Jin", grade: 4, element:"Geo", weapon:"Polearm", gender:"Female", city:"Liyue", image: "images/zz1637940580yunjinpng.png"},
		{name:"Zhongli", grade: 5, element:"Geo", weapon:"Polearm", gender:"Male", city:"Liyue", image: "images/zhonglipng.png"},
		{name:"Tighnari", grade: 5, element:"Dendro", weapon:"Bow", gender:"Male", city:"Sumeru", image: "images/zz1657773321tighnaripng.png"},
		{name:"Collei", grade: 4, element:"Dendro", weapon:"Bow", gender:"Female", city:"Sumeru", image: "images/zz1657773344colleipng.png"},
		{name:"Dori", grade: 4, element:"Electro", weapon:"Claymore", gender:"Female", city:"Sumeru", image: "images/zz1657773372doripng.png"},
	],
	banners: [
		//{start: new Date(""), type:"standard", characters:["", "", "", ""]},
		{start: new Date("2020-09-28"), type:"character", characters: ["Venti", "Barbara", "Fischl", "Xiangling"]},
		{start: new Date("2020-10-20"), type:"character", characters: ["Klee", "Xingqiu", "Noelle", "Sucrose"]},
		{start: new Date("2020-11-11"), type:"character", characters: ["Tartaglia", "Diona", "Beidou", "Ningguang"]},
		{start: new Date("2020-12-01"), type:"character", characters: ["Zhongli", "Xinyan", "Razor", "Chongyun"]},
		{start: new Date("2020-12-23"), type:"character", characters: ["Albedo", "Fischl", "Sucrose", "Bennett"]},
		{start: new Date("2021-01-12"), type:"character", characters: ["Ganyu", "Xiangling", "Xingqiu", "Noelle"]},
		{start: new Date("2021-02-03"), type:"character", characters: ["Xiao", "Diona", "Beidou", "Xinyan"]},
		{start: new Date("2021-02-17"), type:"character", characters: ["Keqing", "Ningguang", "Bennett", "Barbara"]},
		{start: new Date("2021-03-02"), type:"character", characters: ["Hu Tao", "Xingqiu", "Xiangling", "Chongyun"]},
		{start: new Date("2021-03-17"), type:"character", characters: ["Venti", "Sucrose", "Razor", "Noelle"]},
		{start: new Date("2021-04-06"), type:"character", characters: ["Tartaglia", "Rosaria", "Barbara", "Fischl"]},
		{start: new Date("2021-04-28"), type:"character", characters: ["Zhongli", "Yanfei", "Noelle", "Diona"]},
		{start: new Date("2021-05-18"), type:"character", characters: ["Eula", "Xinyan", "Xingqiu", "Beidou"]},
		{start: new Date("2021-06-09"), type:"character", characters: ["Klee", "Barbara", "Sucrose", "Fischl"]},
		{start: new Date("2021-06-29"), type:"character", characters: ["Kazuha", "Rosaria", "Bennett", "Razor"]},
		{start: new Date("2021-07-21"), type:"character", characters: ["Ayaka", "Ningguang", "Chongyun", "Yanfei"]},
		{start: new Date("2021-08-10"), type:"character", characters: ["Yoimiya", "Sayu", "Diona", "Xinyan"]},
		{start: new Date("2021-09-01"), type:"character", characters: ["Raiden", "Sara", "Xiangling", "Sucrose"]},
		{start: new Date("2021-09-21"), type:"character", characters: ["Kokomi", "Rosaria", "Beidou", "Xingqiu"]},
		{start: new Date("2021-10-13"), type:"character", characters: ["Tartaglia", "Ningguang", "Chongyun", "Yanfei"]},
		{start: new Date("2021-11-02"), type:"character", characters: ["Hu Tao", "Thoma", "Diona", "Sayu"]},
		{start: new Date("2021-11-24"), type:"character", characters: ["Albedo", "Eula", "Bennett", "Noelle", "Rosaria"]},
		{start: new Date("2021-12-14"), type:"character", characters: ["Itto", "Gorou", "Barbara", "Xiangling"]},
		{start: new Date("2022-01-05"), type:"character", characters: ["Shenhe", "Xiao", "Yun Jin", "Ningguang", "Chongyun"]},
		{start: new Date("2022-01-25"), type:"character", characters: ["Zhongli", "Ganyu", "Xingqiu", "Beidou", "Yanfei"]},
		{start: new Date("2022-02-16"), type:"character", characters: ["Yae Miko", "Fischl", "Diona", "Thoma"]},
		{start: new Date("2022-03-08"), type:"character", characters: ["Raiden", "Kokomi", "Bennett", "Xinyan", "Sara"]},
		{start: new Date("2022-03-30"), type:"character", characters: ["Ayato", "Venti", "Sucrose", "Xiangling", "Yun Jin"]},
		{start: new Date("2022-04-19"), type:"character", characters: ["Ayaka", "Razor", "Rosaria", "Sayu"]},
		{start: new Date("2022-05-31"), type:"character", characters: ["Yelan", "Xiao", "Barbara", "Noelle", "Yanfei"]},
		{start: new Date("2022-06-21"), type:"character", characters: ["Itto", "Kuki", "Gorou", "Chongyun"]},
		{start: new Date("2022-07-13"), type:"character", characters: ["Kazuha", "Klee", "Heizou", "Ningguang", "Thoma"]},
		{start: new Date("2022-08-02"), type:"character", characters: ["Yoimiya", "Bennett", "Xinyan", "Yun Jin"]},
		{start: new Date("2022-08-24"), type:"character", characters: ["Tighnari", "Zhongli", "Collei", /*FIXME"", ""*/]},
		{start: new Date("2022-09-14"), type:"character", characters: ["Ganyu", "Kokomi", "Dori", /*FIXME"", ""*/]},
	],
};
