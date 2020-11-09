import pymongo
import json

with open('../env.json') as envJSON:
	env = json.load(envJSON)

DB = env["DB"]
myclient = pymongo.MongoClient(DB)
mydb = myclient["Misericordia-Web"]

for i in range(1, 24838):	
	myquery = { "inner_id": str(i) }
	newvalues = { "$set":
		{
			"fechaUlt": 1,
			"estado": "No predicado"
		}
	}
	mycol = mydb["viviendas"]
	mycol.update_one(myquery, newvalues)
	print(i)
