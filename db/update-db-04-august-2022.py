import pymongo
import json

with open('../env.json') as envJSON:
	env = json.load(envJSON)

print(json.dumps(env, indent = 4, sort_keys=True))
DB = env["DB"]
print (DB)

myclient = pymongo.MongoClient(DB)
mydb = myclient["Misericordia-Web"]

print(myclient)

with open('./viviendas.json') as households:
	data = json.load(households)

counter = 0
for i in data:
	counter = counter + 1
	if i["estado"] == "ContestÃ³":
		i["estado"] = "Contestó"
	elif i["estado"] == "No contestÃ³":
		i["estado"] = "No contestó"
	print(i["inner_id"])
	print(i["territorio"])
	print(i["estado"])
	print(i["fechaUlt"]["$numberLong"])
	print(i["noAbonado"])
	print(i["asignado"])
 
	myquery = { "inner_id": i["inner_id"], "territorio": i["territorio"] }
	newvalues = { "$set":
		{
			"noAbonado": i["noAbonado"],
			"estado": i["estado"],
			"fechaUlt": i["fechaUlt"]["$numberLong"],
			"asignado": i["asignado"]
		}
	}

	mycol = mydb["viviendas"]
	mycol.update_one(myquery, newvalues)
	print(i["inner_id"] + " OK")
	print("")
	print("")
	print("")
