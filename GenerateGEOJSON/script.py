# This script generate .json file for your personal hotspots
import csv
import io
import xml.etree.ElementTree as ET
import urllib.request
import geojson
#import lxml


def creategeojson(filename, regions):
    hotspot = []
    for region in regions:
        # Download Hotspot online
        if '-' in region:
            rtype='subnational1'
        else:
            rtype='country'
        url = "http://ebird.org/ws1.1/ref/hotspot/region?rtype=" + rtype + "&r="+ region +"&fmt=xml"


        # option etree
        tree = ET.fromstring(urllib.request.urlopen(url).read())
        for loc in tree.iter('location'):
            d={}
            for loc1 in loc:
                d[loc1.tag] = loc1.text
            try:
                d['loc-name']
            except:
                print('yeahh')
                d['loc-name']=''
            hotspot.append(d)

    #CSV
    #r = csv.reader(io.TextIOWrapper(urllib.request.urlopen(url),encoding="UTF-8"))
    #d = {}
    #k = ["ID", "country", "subnational1", "subnational2", "lat", "long", "name"]
    #hotspot = []
    #for e in list(r):
    #    for i, val in enumerate(e):
    #        d[k[i]] = val
    #    hotspot.append(d)


    # Read personal Observation
    l = list(csv.reader(open(filename, 'rt',encoding="UTF-8")))
    k=l.pop(0)
    myData = []
    for e in l:
        d={}
        for i, val in enumerate(e):
            d[k[i]] = val
        for region in regions:
            if d['State/Province'][:len(region)] == region: # Only take those inside the region
                myData.append(d)



    # Find the unique location name and species from observation: create a set
    location = set()
    sp_list_t = set()
    for obs in myData:
        location.add(obs['Location'])
        sp_list_t.add(obs['Common Name'])


    # Find All Spot
    mySpot = []
    ranking = set()
    for loc in location:
        # find observation at this spot and list sp. nb
        obs_per_location = [obs for obs in myData if obs['Location'] == loc]
        sp_list = set()
        checklists = set()
        for obs in obs_per_location:
            sp_list.add(obs['Common Name'])
            checklists.add(obs['Submission ID'])

        try: # create a new spot from existing hotspot information
            ms = [h for h in hotspot if loc == h['loc-name']][0]
        except: # or if not existing create one
            ms={}
            ms['lat'] = obs_per_location[0]['Latitude']
            ms['lng'] = obs_per_location[0]['Longitude']
            ms['loc-name'] = obs_per_location[0]['Location']
            ms['country-code'] = obs_per_location[0]['State/Province'].split('-')[0]
            ms['subnational2-code'] = ''
            ms['subnational1-code'] = obs_per_location[0]['State/Province']

        ms['sp_list'] = list(sp_list)
        ms['sp_nb'] = len(sp_list)
        ranking.add(len(sp_list))
        ms['checklists'] = list(checklists)
        ms['sp_region_nb'] = len(sp_list_t)
        mySpot.append(ms)

    # Create rank index and sp_max
    rank = sorted(ranking,reverse=True)
    for ms in mySpot:
        ms['rank'] = rank.index(ms['sp_nb'])+1
        ms['sp_max'] = rank[0]


    # Write file with geojson
    features = []
    for ms in mySpot:
        features.append(geojson.Feature(geometry=geojson.Point((float(ms['lng']), float(ms['lat']))), properties=ms))



    with io.open("hotspot_per_country/export_" + '-'.join(regions) + ".geojson", "w" , encoding="UTF-8") as file:
        print('{\n\t"type": "FeatureCollection",\n\t"features":', file=file)
        geojson.dump(features, file, ensure_ascii=False)
        print('\n}', file=file)






filename="MyEbirdData/MyEBirdData_2016_02.csv"
regions=['CA', 'CA-QC', 'CH', 'FR', 'FR-A','FR-H','FR-U', 'GB', 'IS', 'DE' , 'IT', 'KE','AT', 'SE', 'US', 'BE', 'HR', 'DK','TN']
region_country = ['CA', 'CH', 'FR', 'GB', 'IS', 'DE', 'IT', 'KE', 'AT', 'SE', 'US', 'DK', 'BE', 'HR','TN','RE']
#region_country_david = ['BW', 'SE', 'GB', 'FR', 'CH', 'CA', 'ZM','US']
#for region in regions:
#    CreateGeoJson(filename, [region])

creategeojson(filename,region_country)
#CreateGeoJson(filename,['CH'])

#creategeojson(filename,['RE'])
