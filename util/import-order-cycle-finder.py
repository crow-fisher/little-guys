import matplotlib 

import os 

os.chdir('static')

dirStack = []
dirFiles = {}
curDir = ""
for s in os.scandir():
    if s.is_dir():
        dirStack.append(s.name)