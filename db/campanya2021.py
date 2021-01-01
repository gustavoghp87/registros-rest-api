import pymongo
import pandas as pd
import json

with open('../env.json') as envJSON:
	env = json.load(envJSON)

DB = env["DB"]
myclient = pymongo.MongoClient(DB)
mydb = myclient["Misericordia-Web"]

data = pd.read_excel('campanya-2021.xlsx')

for i in data.index:
	paquete = int(data['paquete'][i])
	id      = int(data['id'][i])
	desde   = int(data['desde'][i])
	al      = int(data['al'][i])

	pack = {"paquete": paquete, "id": id, "desde": desde, "al": al}

	print("\n", pack, "\n")

	mycol = mydb["campanya"]

	mycol.insert_one(pack)

