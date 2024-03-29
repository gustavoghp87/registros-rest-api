import pymongo
import pandas as pd
import json
from datetime import datetime


with open('../env.json') as envJSON:
	env = json.load(envJSON)

print(json.dumps(env, indent = 4, sort_keys=True))
DB = env["DB"]
print (DB)

myclient = pymongo.MongoClient(DB)
mydb = myclient["Misericordia-Web"]

print(myclient)

data = pd.read_excel('territorio-automatizacion-final5.xlsx')

for i in data.index:
	# territorio   = str(int(data['territorio'][i]))
	# manzana      = str(int(data['manzana'][i]))
	telefono     = str(data['teléfono'][i])
	estado       = str(data['Estado'][i])
	noAbonado    = str(data['No abonado'][i])
	if (noAbonado=="True" or noAbonado=="true" or noAbonado==True):
		noAbonado = True
	else:
		noAbonado = False

	timestamp = 1604232000000
	if (estado=="No predicado"):
		timestamp = 1

	# mydb.viviendas.insert_one(vivienda)
	myquery = { "telefono": telefono }
	newvalues = { "$set":
		{
			"noAbonado": noAbonado,
			"estado": estado,
			"fechaUlt": timestamp
		}
	}

	mycol = mydb["viviendas"]
	mycol.update_one(myquery, newvalues)
	print(i, telefono, noAbonado, estado, timestamp)
