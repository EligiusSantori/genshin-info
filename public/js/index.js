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
		{name:"Alhaitham", grade: 5, element:"Dendro", weapon:"Sword", gender:"Male", city:"Sumeru", image: "images/zzzzz-1670593573alhathampng.png"},
		{name:"Aloy", grade: 4, element:"Cryo", weapon:"Bow", gender:"Female", city:"Other", image: "images/zz1627420885aloypng.png"},
		{name:"Amber", grade: 4, element:"Pyro", weapon:"Bow", gender:"Female", city:"Mondstadt", image: "images/amberpng.png"},
		{name:"Arlecchino", grade: 5, element:"Pyro", weapon:"Polearm", gender:"Female", city:"Snezhnaya", image: "images/zzzzz-1710398605arlecchino.png"},
		{name:"Ayaka", grade: 5, element:"Cryo", weapon:"Sword", gender:"Female", city:"Inazuma", image: "images/ayakapng.png"},
		{name:"Ayato", grade: 5, element:"Hydro", weapon:"Sword", gender:"Male", city:"Inazuma", image: "images/zz1646140324ayatopng.png"},
		{name:"Baizhu", grade: 5, element:"Dendro", weapon:"Catalyst", gender:"Male", city:"Liyue", image: "images/zzzzz-1677684981baizhupng.png"},
		{name:"Barbara", grade: 4, element:"Hydro", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/barbarapng.png"},
		{name:"Beidou", grade: 4, element:"Electro", weapon:"Claymore", gender:"Female", city:"Liyue", image: "images/beidoupng.png"},
		{name:"Bennett", grade: 4, element:"Pyro", weapon:"Sword", gender:"Male", city:"Mondstadt", image: "images/bennettpng.png"},
		{name:"Candace", grade: 4, element:"Hydro", weapon:"Polearm", gender:"Female", city:"Sumeru", image: "images/zzzzz-1661471092candacepng.png"},
		{name:"Charlotte", grade: 4, element:"Cryo", weapon:"Catalyst", gender:"Female", city:"Fontaine", image: "images/zzzzz-1695968648charlotte.png"},
		{name:"Chasca", grade: 5, element:"Anemo", weapon:"Bow", gender:"Female", city:"Natlan", image: "images/zzzzz-1728475657chasca.png"},
		{name:"Chevreuse", grade: 4, element:"Pyro", weapon:"Polearm", gender:"Female", city:"Fontaine", image: "images/zzzzz-1699499042chevreuse.png"},
		{name:"Chiori", grade: 5, element:"Geo", weapon:"Sword", gender:"Female", city:"Inazuma", image: "images/zzzzz-1706866671chiori.png"},
		{name:"Chongyun", grade: 4, element:"Cryo", weapon:"Claymore", gender:"Male", city:"Liyue", image: "images/chongyunpng.png"},
		{name:"Citlali", grade: 5, element:"Cryo", weapon:"Catalyst", gender:"Female", city:"Natlan", image: "images/zzzzz-1732173897citlali.png"},
		{name:"Clorinde", grade: 5, element:"Electro", weapon:"Sword", gender:"Female", city:"Fontaine", image: "images/zzzzz-1714099052clorinde.png"},
		{name:"Collei", grade: 4, element:"Dendro", weapon:"Bow", gender:"Female", city:"Sumeru", image: "images/zz1657773344colleipng.png"},
		{name:"Cyno", grade: 5, element:"Electro", weapon:"Polearm", gender:"Male", city:"Sumeru", image: "images/zzzzz-1661471071cynopng.png"},
		{name:"Dehya", grade: 5, element:"Pyro", weapon:"Claymore", gender:"Female", city:"Sumeru", image: "images/zzzzz-1674180721dehyapng.png"},
		{name:"Diluc", grade: 5, element:"Pyro", weapon:"Claymore", gender:"Male", city:"Mondstadt", image: "images/dilucpng.png"},
		{name:"Diona", grade: 4, element:"Cryo", weapon:"Bow", gender:"Female", city:"Mondstadt", image: "images/dionapng.png"},
		{name:"Dori", grade: 4, element:"Electro", weapon:"Claymore", gender:"Female", city:"Sumeru", image: "images/zz1657773372doripng.png"},
		{name:"Emilie", grade: 5, element:"Dendro", weapon:"Polearm", gender:"Female", city:"Fontaine", image: "images/zzzzz-1717617423emilie.png"},
		{name:"Eula", grade: 5, element:"Cryo", weapon:"Claymore", gender:"Female", city:"Mondstadt", image: "images/zz1616626517eulapng.png"},
		{name:"Faruzan", grade: 4, element:"Anemo", weapon:"Bow", gender:"Female", city:"Sumeru", image: "images/zzzzz-1667841086faruzanpng.png"},
		{name:"Fischl", grade: 4, element:"Electro", weapon:"Bow", gender:"Female", city:"Mondstadt", image: "images/fischlpng.png"},
		{name:"Freminet", grade: 4, element:"Cryo", weapon:"Claymore", gender:"Male", city:"Fontaine", image: "images/zzzzz-1688596978freminet.png"},
		{name:"Furina", grade: 5, element:"Hydro", weapon:"Sword", gender:"Female", city:"Fontaine", image: "images/zzzzz-1695968637furina.png"},
		{name:"Gaming", grade: 4, element:"Pyro", weapon:"Claymore", gender:"Male", city:"Liyue", image: "images/zzzzz-1703120846gaming.png"},
		{name:"Ganyu", grade: 5, element:"Cryo", weapon:"Bow", gender:"Female", city:"Liyue", image: "images/ganyupng.png"},
		{name:"Gorou", grade: 4, element:"Geo", weapon:"Bow", gender:"Male", city:"Inazuma", image: "images/zz1634212991goroupng.png"},
		{name:"Heizou", grade: 4, element:"Anemo", weapon:"Catalyst", gender:"Male", city:"Inazuma", image: "images/zz1652941189heizoupng.png"},
		{name:"Hu Tao", grade: 5, element:"Pyro", weapon:"Polearm", gender:"Female", city:"Liyue", image: "images/hutaopng.png"},
		{name:"Itto", grade: 5, element:"Geo", weapon:"Claymore", gender:"Male", city:"Inazuma", image: "images/zz1634212968ittopng.png"},
		{name:"Jean", grade: 5, element:"Anemo", weapon:"Sword", gender:"Female", city:"Mondstadt", image: "images/jeanpng.png"},
		{name:"Kachina", grade: 4, element:"Geo", weapon:"Polearm", gender:"Female", city:"Natlan", image: "images/zzzzz-1721283344kachina.png"},
		{name:"Kaeya", grade: 4, element:"Cryo", weapon:"Sword", gender:"Male", city:"Mondstadt", image: "images/kaeyapng.png"},
		{name:"Kaveh", grade: 4, element:"Dendro", weapon:"Claymore", gender:"Male", city:"Sumeru", image: "images/zzzzz-1677684961kavehpng.png"},
		{name:"Kazuha", grade: 5, element:"Anemo", weapon:"Sword", gender:"Male", city:"Inazuma", image: "images/zz1619371051kazuhapng.png"},
		{name:"Keqing", grade: 5, element:"Electro", weapon:"Sword", gender:"Female", city:"Liyue", image: "images/keqingpng.png"},
		{name:"Kinich", grade: 5, element:"Dendro", weapon:"Claymore", gender:"Male", city:"Natlan", image: "images/zzzzz-1721283344kinich.png"},
		{name:"Kirara", grade: 4, element:"Dendro", weapon:"Sword", gender:"Female", city:"Inazuma", image: "images/zzzzz-1681394345momoka.png"},
		{name:"Klee", grade: 5, element:"Pyro", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/kleepng.png"},
		{name:"Kokomi", grade: 5, element:"Hydro", weapon:"Catalyst", gender:"Female", city:"Inazuma", image: "images/zz1627420866kokomipng.png"},
		{name:"Kuki", grade: 4, element:"Electro", weapon:"Sword", gender:"Female", city:"Inazuma", image: "images/zz1650057785shinobupng.png"},
		{name:"Lan Yan", grade: 4, element:"Anemo", weapon:"Catalyst", gender:"Female", city:"Liyue", image: "images/zzzzz-1732173897lanyan.png"},
		{name:"Layla", grade: 4, element:"Cryo", weapon:"Sword", gender:"Female", city:"Sumeru", image: "images/zzzzz-1664484004laylapng.png"},
		{name:"Lisa", grade: 4, element:"Electro", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/lisapng.png"},
		{name:"Lynette", grade: 4, element:"Anemo", weapon:"Sword", gender:"Female", city:"Fontaine", image: "images/zzzzz-1688596955linette.png"},
		{name:"Lyney", grade: 5, element:"Pyro", weapon:"Bow", gender:"Male", city:"Fontaine", image: "images/zzzzz-1688596936liney.png"},
		{name:"Mavuika", grade: 5, element:"Pyro", weapon:"Claymore", gender:"Female", city:"Natlan", image: "images/zzzzz-1732173898mavuika.png"},
		{name:"Mika", grade: 4, element:"Cryo", weapon:"Polearm", gender:"Male", city:"Mondstadt", image: "images/zzzzz-1674180758mikapng.png"},
		{name:"Mizuki", grade: 5, element:"Anemo", weapon:"Catalyst", gender:"Female", city:"Inazuma", image: "images/zzzzz-1735779326mizuki.png"},
		{name:"Mona", grade: 5, element:"Hydro", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/monapng.png"},
		{name:"Mualani", grade: 5, element:"Hydro", weapon:"Catalyst", gender:"Female", city:"Natlan", image: "images/zzzzz-1721283344mualani.png"},
		{name:"Nahida", grade: 5, element:"Dendro", weapon:"Catalyst", gender:"Female", city:"Sumeru", image: "images/zzzzz-1664483983nahidapng.png"},
		{name:"Navia", grade: 5, element:"Geo", weapon:"Claymore", gender:"Female", city:"Fontaine", image: "images/zzzzz-1699499042navia.png"},
		{name:"Neuvillette", grade: 5, element:"Hydro", weapon:"Catalyst", gender:"Male", city:"Fontaine", image: "images/zzzzz-1692266357neuvillette.png"},
		{name:"Nilou", grade: 5, element:"Hydro", weapon:"Sword", gender:"Female", city:"Sumeru", image: "images/zzzzz-1661471050niloupng.png"},
		{name:"Ningguang", grade: 4, element:"Geo", weapon:"Catalyst", gender:"Female", city:"Liyue", image: "images/ningguangpng.png"},
		{name:"Noelle", grade: 4, element:"Geo", weapon:"Claymore", gender:"Female", city:"Mondstadt", image: "images/noellepng.png"},
		{name:"Ororon", grade: 4, element:"Electro", weapon:"Bow", gender:"Male", city:"Natlan", image: "images/zzzzz-1728475657ororun.png"},
		{name:"Qiqi", grade: 5, element:"Cryo", weapon:"Sword", gender:"Female", city:"Liyue", image: "images/qiqipng.png"},
		{name:"Raiden", grade: 5, element:"Electro", weapon:"Polearm", gender:"Female", city:"Inazuma", image: "images/zz1627420825shougunpng.png"},
		{name:"Razor", grade: 4, element:"Electro", weapon:"Claymore", gender:"Male", city:"Mondstadt", image: "images/razorpng.png"},
		{name:"Rosaria", grade: 4, element:"Cryo", weapon:"Polearm", gender:"Female", city:"Mondstadt", image: "images/zz1612313327r2png.png"},
		{name:"Sara", grade: 4, element:"Electro", weapon:"Bow", gender:"Female", city:"Inazuma", image: "images/zz1627420840sarapng.png"},
		{name:"Sayu", grade: 4, element:"Anemo", weapon:"Claymore", gender:"Female", city:"Inazuma", image: "images/zz1623072238sayupng.png"},
		{name:"Scaramouche", grade: 5, element:"Anemo", weapon:"Catalyst", gender:"Male", city:"Sumeru", image: "images/zzzzz-1667841064wandererpng.png"},
		{name:"Sethos", grade: 4, element:"Electro", weapon:"Bow", gender:"Male", city:"Sumeru", image: "images/zzzzz-1714099052sethos.png"},
		{name:"Shenhe", grade: 5, element:"Cryo", weapon:"Polearm", gender:"Female", city:"Liyue", image: "images/zz1637940561shenhepng.png"},
		{name:"Sigewinne", grade: 5, element:"Hydro", weapon:"Bow", gender:"Female", city:"Fontaine", image: "images/zzzzz-1714099052sigewinne.png"},
		{name:"Sucrose", grade: 4, element:"Anemo", weapon:"Catalyst", gender:"Female", city:"Mondstadt", image: "images/sucrosepng.png"},
		{name:"Tartaglia", grade: 5, element:"Hydro", weapon:"Bow", gender:"Male", city:"Snezhnaya", image: "images/tartagliapng.png"},
		{name:"Thoma", grade: 4, element:"Pyro", weapon:"Polearm", gender:"Male", city:"Inazuma", image: "images/zz1630625061thomapng.png"},
		{name:"Tighnari", grade: 5, element:"Dendro", weapon:"Bow", gender:"Male", city:"Sumeru", image: "images/zz1657773321tighnaripng.png"},
		{name:"Venti", grade: 5, element:"Anemo", weapon:"Bow", gender:"Male", city:"Mondstadt", image: "images/ventipng.png"},
		{name:"Wriothesley", grade: 5, element:"Cryo", weapon:"Catalyst", gender:"Male", city:"Fontaine", image: "images/zzzzz-1692266373wriothesley.png"},
		{name:"Xiangling", grade: 4, element:"Pyro", weapon:"Polearm", gender:"Female", city:"Liyue", image: "images/xianglingpng.png"},
		{name:"Xianyun", grade: 5, element:"Anemo", weapon:"Catalyst", gender:"Female", city:"Liyue", image: "images/zzzzz-1703120846liuyun.png"},
		{name:"Xiao", grade: 5, element:"Anemo", weapon:"Polearm", gender:"Male", city:"Liyue", image: "images/xiaopng.png"},
		{name:"Xilonen", grade: 5, element:"Geo", weapon:"Sword", gender:"Female", city:"Natlan", image: "images/zzzzz-1724937918xilonen.png"},
		{name:"Xingqiu", grade: 4, element:"Hydro", weapon:"Sword", gender:"Male", city:"Liyue", image: "images/xingqiupng.png"},
		{name:"Xinyan", grade: 4, element:"Pyro", weapon:"Claymore", gender:"Female", city:"Liyue", image: "images/xinyanpng.png"},
		{name:"Yae Miko", grade: 5, element:"Electro", weapon:"Catalyst", gender:"Female", city:"Inazuma", image: "images/zz1641436957yaepng.png"},
		{name:"Yanfei", grade: 4, element:"Pyro", weapon:"Catalyst", gender:"Female", city:"Liyue", image: "images/zz1616626517yanfeipng.png"},
		{name:"Yaoyao", grade: 4, element:"Dendro", weapon:"Polearm", gender:"Female", city:"Liyue", image: "images/zzzzz-1670593556yaoyaopng.png"},
		{name:"Yelan", grade: 5, element:"Hydro", weapon:"Bow", gender:"Female", city:"Liyue", image: "images/zz1650057768yelanpng.png"},
		{name:"Yoimiya", grade: 5, element:"Pyro", weapon:"Bow", gender:"Female", city:"Inazuma", image: "images/zz1623072217yoimiyapng.png"},
		{name:"Yun Jin", grade: 4, element:"Geo", weapon:"Polearm", gender:"Female", city:"Liyue", image: "images/zz1637940580yunjinpng.png"},
		{name:"Zhongli", grade: 5, element:"Geo", weapon:"Polearm", gender:"Male", city:"Liyue", image: "images/zhonglipng.png"},
	],
	banners: [
		{start: new Date("2020-09-28"), version: "1.0", type:"character", characters: ["Venti", "Barbara", "Fischl", "Xiangling"]},
		{start: new Date("2020-10-20"), version: "1.0", type:"character", characters: ["Klee", "Xingqiu", "Noelle", "Sucrose"]},
		{start: new Date("2020-11-11"), version: "1.1", type:"character", characters: ["Tartaglia", "Diona", "Beidou", "Ningguang"]},
		{start: new Date("2020-12-01"), version: "1.1", type:"character", characters: ["Zhongli", "Xinyan", "Razor", "Chongyun"]},
		{start: new Date("2020-12-23"), version: "1.2", type:"character", characters: ["Albedo", "Fischl", "Sucrose", "Bennett"]},
		{start: new Date("2021-01-12"), version: "1.2", type:"character", characters: ["Ganyu", "Xiangling", "Xingqiu", "Noelle"]},
		{start: new Date("2021-02-03"), version: "1.3", type:"character", characters: ["Xiao", "Diona", "Beidou", "Xinyan"]},
		{start: new Date("2021-02-17"), version: "1.3", type:"character", characters: ["Keqing", "Ningguang", "Bennett", "Barbara"]},
		{start: new Date("2021-03-02"), version: "1.3", type:"character", characters: ["Hu Tao", "Xingqiu", "Xiangling", "Chongyun"]},
		{start: new Date("2021-03-17"), version: "1.4", type:"character", characters: ["Venti", "Sucrose", "Razor", "Noelle"]},
		{start: new Date("2021-04-06"), version: "1.4", type:"character", characters: ["Tartaglia", "Rosaria", "Barbara", "Fischl"]},
		{start: new Date("2021-04-28"), version: "1.5", type:"character", characters: ["Zhongli", "Yanfei", "Noelle", "Diona"]},
		{start: new Date("2021-05-18"), version: "1.5", type:"character", characters: ["Eula", "Xinyan", "Xingqiu", "Beidou"]},
		{start: new Date("2021-06-09"), version: "1.6", type:"character", characters: ["Klee", "Barbara", "Sucrose", "Fischl"]},
		{start: new Date("2021-06-29"), version: "1.6", type:"character", characters: ["Kazuha", "Rosaria", "Bennett", "Razor"]},
		{start: new Date("2021-07-21"), version: "2.0", type:"character", characters: ["Ayaka", "Ningguang", "Chongyun", "Yanfei"]},
		{start: new Date("2021-08-10"), version: "2.0", type:"character", characters: ["Yoimiya", "Sayu", "Diona", "Xinyan"]},
		{start: new Date("2021-09-01"), version: "2.1", type:"character", characters: ["Raiden", "Sara", "Xiangling", "Sucrose"]},
		{start: new Date("2021-09-21"), version: "2.1", type:"character", characters: ["Kokomi", "Rosaria", "Beidou", "Xingqiu"]},
		{start: new Date("2021-10-13"), version: "2.2", type:"character", characters: ["Tartaglia", "Ningguang", "Chongyun", "Yanfei"]},
		{start: new Date("2021-11-02"), version: "2.2", type:"character", characters: ["Hu Tao", "Thoma", "Diona", "Sayu"]},
		{start: new Date("2021-11-24"), version: "2.3", type:"character", characters: ["Albedo", "Eula", "Bennett", "Noelle", "Rosaria"]},
		{start: new Date("2021-12-14"), version: "2.3", type:"character", characters: ["Itto", "Gorou", "Barbara", "Xiangling"]},
		{start: new Date("2022-01-05"), version: "2.4", type:"character", characters: ["Shenhe", "Xiao", "Yun Jin", "Ningguang", "Chongyun"]},
		{start: new Date("2022-01-25"), version: "2.4", type:"character", characters: ["Zhongli", "Ganyu", "Xingqiu", "Beidou", "Yanfei"]},
		{start: new Date("2022-02-16"), version: "2.5", type:"character", characters: ["Yae Miko", "Fischl", "Diona", "Thoma"]},
		{start: new Date("2022-03-08"), version: "2.5", type:"character", characters: ["Raiden", "Kokomi", "Bennett", "Xinyan", "Sara"]},
		{start: new Date("2022-03-30"), version: "2.6", type:"character", characters: ["Ayato", "Venti", "Sucrose", "Xiangling", "Yun Jin"]},
		{start: new Date("2022-04-19"), version: "2.6", type:"character", characters: ["Ayaka", "Razor", "Rosaria", "Sayu"]},
		{start: new Date("2022-05-31"), version: "2.7", type:"character", characters: ["Yelan", "Xiao", "Barbara", "Noelle", "Yanfei"]},
		{start: new Date("2022-06-21"), version: "2.7", type:"character", characters: ["Itto", "Kuki", "Gorou", "Chongyun"]},
		{start: new Date("2022-07-13"), version: "2.8", type:"character", characters: ["Kazuha", "Klee", "Heizou", "Ningguang", "Thoma"]},
		{start: new Date("2022-08-02"), version: "2.8", type:"character", characters: ["Yoimiya", "Bennett", "Xinyan", "Yun Jin"]},
		{start: new Date("2022-08-24"), version: "3.0", type:"character", characters: ["Tighnari", "Zhongli", "Collei", "Diona", "Fischl"]},
		{start: new Date("2022-09-10"), version: "3.0", type:"character", characters: ["Ganyu", "Kokomi", "Dori", "Sucrose", "Xingqiu"]},
		{start: new Date("2022-09-28"), version: "3.1", type:"character", characters: ["Cyno", "Venti", "Candace", "Kuki", "Sayu"]},
		{start: new Date("2022-10-14"), version: "3.1", type:"character", characters: ["Nilou", "Albedo", "Barbara", "Beidou", "Xiangling"]},
		{start: new Date("2022-11-02"), version: "3.2", type:"character", characters: ["Nahida", "Yoimiya", "Razor", "Noelle", "Bennett"]},
		{start: new Date("2022-11-18"), version: "3.2", type:"character", characters: ["Yae Miko", "Tartaglia", "Layla", "Thoma", "Heizou"]},
		{start: new Date("2022-12-07"), version: "3.3", type:"character", characters: ["Scaramouche", "Itto", "Faruzan", "Gorou", "Yanfei"]},
		{start: new Date("2022-12-27"), version: "3.3", type:"character", characters: ["Raiden", "Ayato", "Rosaria", "Sayu", "Sara"]},
		{start: new Date("2023-01-18"), version: "3.4", type:"character", characters: ["Alhaitham", "Xiao", "Yaoyao", "Yun Jin", "Xinyan"]},
		{start: new Date("2023-02-07"), version: "3.4", type:"character", characters: ["Hu Tao", "Yelan", "Xingqiu", "Ningguang", "Beidou"]},
		{start: new Date("2023-03-01"), version: "3.5", type:"character", characters: ["Dehya", "Cyno", "Bennett", "Barbara", "Collei"]},
		{start: new Date("2023-03-21"), version: "3.5", type:"character", characters: ["Shenhe", "Ayaka", "Diona", "Sucrose", "Mika"]},
		{start: new Date("2023-04-12"), version: "3.6", type:"character", characters: ["Nahida", "Nilou", "Kuki", "Dori", "Layla"]},
		{start: new Date("2023-05-02"), version: "3.6", type:"character", characters: ["Baizhu", "Ganyu", "Kaveh", "Candace", "Fischl"]},
		{start: new Date("2023-05-24"), version: "3.7", type:"character", characters: ["Yoimiya", "Yae Miko", "Kirara", "Yun Jin", "Chongyun"]},
		{start: new Date("2023-06-13"), version: "3.7", type:"character", characters: ["Alhaitham", "Kazuha", "Heizou", "Xiangling", "Yaoyao"]},
		{start: new Date("2023-07-05"), version: "3.8", type:"character", characters: ["Eula", "Klee", "Mika", "Razor", "Thoma"]},
		{start: new Date("2023-07-25"), version: "3.8", type:"character", characters: ["Kokomi", "Scaramouche", "Faruzan", "Rosaria", "Yanfei"]},
		{start: new Date("2023-08-16"), version: "4.0", type:"character", characters: ["Lyney", "Yelan", "Lynette", "Bennett", "Barbara"]},
		{start: new Date("2023-09-05"), version: "4.0", type:"character", characters: ["Zhongli", "Tartaglia", "Freminet", "Sayu", "Noelle"]},
		{start: new Date("2023-09-27"), version: "4.1", type:"character", characters: ["Neuvillette", "Hu Tao", "Fischl", "Xingqiu", "Diona"]},
		{start: new Date("2023-10-17"), version: "4.1", type:"character", characters: ["Wriothesley", "Venti", "Chongyun", "Thoma", "Dori"]},
		{start: new Date("2023-11-08"), version: "4.2", type:"character", characters: ["Furina", "Baizhu", "Charlotte", "Collei", "Beidou"]},
		{start: new Date("2023-11-28"), version: "4.2", type:"character", characters: ["Cyno", "Ayato", "Kirara", "Kuki", "Xiangling"]},
		{start: new Date("2023-12-20"), version: "4.3", type:"character", characters: ["Navia", "Ayaka", "Sucrose", "Rosaria", "Candace"]},
		{start: new Date("2024-01-09"), version: "4.3", type:"character", characters: ["Raiden", "Yoimiya", "Chevreuse", "Sara", "Bennett"]},
		{start: new Date("2024-01-31"), version: "4.4", type:"character", characters: ["Xianyun", "Nahida", "Gaming", "Faruzan", "Noelle"]},
		{start: new Date("2024-02-20"), version: "4.4", type:"character", characters: ["Xiao", "Yae Miko", "Yaoyao", "Xinyan", "Ningguang"]},
		{start: new Date("2024-03-13"), version: "4.5", type:"character", characters: ["Chiori", "Itto", "Albedo", "Diluc", "Eula", "Jean", "Klee", "Mona", "Gorou", "Yun Jin", "Dori"]},
		{start: new Date("2024-04-02"), version: "4.5", type:"character", characters: ["Neuvillette", "Kazuha", "Barbara", "Xingqiu", "Yanfei"]},
		{start: new Date("2024-04-24"), version: "4.6", type:"character", characters: ["Arlecchino", "Lyney", "Freminet", "Lynette", "Xiangling"]},
		{start: new Date("2024-05-14"), version: "4.6", type:"character", characters: ["Scaramouche", "Baizhu", "Beidou", "Faruzan", "Layla"]},
		{start: new Date("2024-06-05"), version: "4.7", type:"character", characters: ["Clorinde", "Alhaitham", "Sethos", "Bennett", "Thoma"]},
		{start: new Date("2024-06-25"), version: "4.7", type:"character", characters: ["Sigewinne", "Furina", "Noelle", "Gaming", "Rosaria"]},
		{start: new Date("2024-07-17"), version: "4.8", type:"character", characters: ["Navia", "Nilou", "Kirara", "Kaveh", "Ningguang"]},
		{start: new Date("2024-08-06"), version: "4.8", type:"character", characters: ["Emilie", "Yelan", "Yanfei", "Xiangling", "Razor"]},
		{start: new Date("2024-08-28"), version: "5.0", type:"character", characters: ["Mualani", "Kazuha", "Kachina", "Xinyan", "Bennett"]},
		{start: new Date("2024-09-17"), version: "5.0", type:"character", characters: ["Kinich", "Raiden", "Thoma", "Sara", "Chevreuse"]},
		{start: new Date("2024-10-09"), version: "5.1", type:"character", characters: ["Xilonen", "Chiori", "Dori", "Candace", "Collei"]},
		{start: new Date("2024-10-29"), version: "5.1", type:"character", characters: ["Nahida", "Hu Tao", "Sethos", "Xingqiu", "Kuki"]},
		{start: new Date("2024-11-20"), version: "5.2", type:"character", characters: ["Chasca", "Lyney", "Ororon", "Sucrose", "Barbara"]},
		{start: new Date("2024-12-10"), version: "5.2", type:"character", characters: ["Neuvillette", "Zhongli", "Heizou", "Fischl", "Yaoyao"]},
		{start: new Date("2025-01-01"), version: "5.3", type:"character", characters: ["Mavuika", "Citlali", "Kachina", "Bennett", "Diona"]},
		{start: new Date("2025-01-21"), version: "5.3", type:"character", characters: ["Arlecchino", "Clorinde", "Baizhu", "Shenhe", "Keqing", "Ganyu", "Qiqi", "Tartaglia", "Xiao", "Lan Yan", "Chevreuse", "Rosaria"]},
		//{start: new Date(""), version: "5.4", type:"character", characters: ["Mizuki", "Sigewinne", "", "", ""]},
		//{start: new Date(""), version: "5.4", type:"character", characters: ["Wriothesley", "Furina", "", "", ""]},
		//{start: new Date(""), version: "", type:"character", characters: ["", "", "", "", ""]},
	],
};
