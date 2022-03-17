import pymongo
import json

with open('../env.json') as envJSON:
	env = json.load(envJSON)

DB = env["DB"]
myclient = pymongo.MongoClient(DB)
mydb = myclient["Misericordia-Web-Testing"]

firstPhones = [
    1160882000,
    1166407000,
    1155651000,
	1124174000,
	2235978000,
	1132019000,
	2284637000,
	1137289000,
	1165027000,
	1156271000,
	1153656000,
	1152753000,
	1142590000,
	1172113000,
	1145757000,
	1145827000,
	1128741000,
	1144538000,
	1152309000,
	1147548000
]

packs = []
i = 0
while i < 20:
	j = 0
	while j < 20:
		desde = int(firstPhones[i]) + 50 * int(j)
		al    = firstPhones[i] + 50 * (int(j) + 1) - 1
		pack = {"id": i * 20 + j + 1, "desde": desde, "al": al}
		packs.append(pack)
		j = j + 1
	i = i + 1

for pack in packs:
	print(pack)
	print("")
	mycol = mydb["campaign2022"]
	mycol.insert_one(pack)
