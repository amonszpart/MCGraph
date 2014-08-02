#!/usr/bin/env python

import sys, re
import itertools as it
import json
import numpy as np
import random, colour

def genDistinctColors(num_colors):
    colors = []
    for i in np.arange(0, 360, 360. / num_colors):
        hue = i / 360.
        sat = 90 + random.random() * 10;
        sat /= 100.
        lig = 50 + random.random() * 10;
        lig /= 100.

        c = colour.Color(hue=hue, saturation=sat, luminance=lig)
        colors.append(c.hex)
    return colors

def processKGInput(part, curLevel=0):
  # split up into all nodes at this level
  if len(part) > 1:
    res = {}
    label = part[0]
    #current = [part[1]]
    current = []
    for line in part[1:]:
      if indC(line) > curLevel:
        current.append(line)
      else:
        res[label.strip()] = processKGInput(current, curLevel + 2)
        label = line
        current = []
    res[label.strip()] = processKGInput(current, curLevel + 2)
    return res
  else:
    return {} 
    #return [x.strip() for x in part]

def processKGDictLevel(kgDict):
  res = []
  for key, value in kgDict.iteritems():
    for child in value:
      res.append({"name": child, "group": key, "type": "node"})
    res += processKGDictLevel(value)
  return res

def processKGDictLevelLinks(kgDict):
  res = []
  for key, value in kgDict.iteritems():
    for child in value:
      res.append({"source": key, "target": child, "type": "member", "weight": 1})
    res += processKGDictLevelLinks(value)
  return res
  
def indC(s):
  return len(s) - len(s.lstrip())

f = open(sys.argv[1]).read()

parts = {}
nextPart = ""
with open(sys.argv[1], 'r') as f:
  for key,part in it.groupby(f, lambda line: line.startswith('S:')):
    if key:
      nextPart = list(part)[0]
    else:
      parts[nextPart] = list(part)

KGdata = processKGInput(parts["S:KG\n"], 0)
AGdata = [x.strip() for x in parts["S:AG\n"]]
RSdata = [x.strip() for x in parts["S:RS\n"]]

# create KG json
KGnodes = []
KGnodes.append({"name": "Knowledge graph", "type": "root", "fixed": true, "y": 0.1, "x": 0.5})
for key, value in KGdata['Knowledge graph'].iteritems():
  KGnodes.append({"name": key, "type": "sub-knowledge graph"})

KGnodes += processKGDictLevel(KGdata['Knowledge graph'])
KGlinks = processKGDictLevelLinks(KGdata)

KG = {"nodes": KGnodes, "links": KGlinks}

[x["group"] for x in KG["nodes"] if x["name"] == "Sphere"]

# create AG json
AGnodes = []
AGlinks = []
colours = genDistinctColors(len(AGdata))
for i, node in enumerate(AGdata):
    AGnodes.append({"name": node, "type": "node", "color": colours[i]})

# create AG links
for rel in RSdata:
    parts = rel.split(":")
    if len(parts) == 3:
        linkname = parts[0] + "_" + parts[2] + "_" + parts[1]
        AGnodes.append({"name": linkname, "type": "relation", "label": " ", "color": "#FFFFFF"})
        AGlinks.append({"source": parts[0], "target": linkname, "type": "relation"})
        AGlinks.append({"source": linkname, "target": parts[1], "type": "relation"})

AG = {"nodes": AGnodes, "links": AGlinks}

# create RS
RSlinks = []
for rel in RSdata:
    if len(parts) == 3:
        parts = rel.split(":")
        linkname = "abstr_" + parts[0] + "_" + parts[2] + "_" + parts[1]
        kgType = [x["group"] for x in KG["nodes"] if x["name"] == parts[2]][0]
        RSlinks.append({"source": parts[2], "target": linkname, "type": kgType })
    else:
        kgType = [x["group"] for x in KG["nodes"] if x["name"] == parts[1]][0]
        RSlinks.append({"source": parts[1], "target": "abstr_" + parts[0], "type": kgType})
RS = {"nodes": [], "links": RSlinks}

# write files
with open(sys.argv[2] + ".json", "w") as outfile:
  json.dump(KG, outfile)

with open(sys.argv[2] + "_abstraction.json", "w") as outfile:
  json.dump(AG, outfile)

with open(sys.argv[2] + "_relation.json", "w") as outfile:
  json.dump(RS, outfile)
