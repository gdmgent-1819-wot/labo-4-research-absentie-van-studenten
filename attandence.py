import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import firestore
from time import time, sleep
import datetime
import os
import sys
import subprocess
import numpy as np
from ast import literal_eval
import threading
import nxppy




serviceAccountKey = './attandace-ahs-firebase-adminsdk.json'
databaseURL = 'https://attandace-ahs.firebaseio.com'
cred = credentials.Certificate('./attandace-ahs-firebase-adminsdk.json')
mifare = nxppy.Mifare()

try:
    # Fetch the service account key JSON file contents
    firebase_cred = credentials.Certificate(serviceAccountKey)

    # Initalize the app with a service account; granting admin privileges
    firebase_admin.initialize_app(cred)

    db = firestore.client()

except:
    print('Unable to initialize Firebase: {}'.format(sys.exc_info()[0]))
    sys.exit(1)
    


def writeToFireStore(uid):
  #the colors 
    print("were writing")
    doc_ref = db.collection(u'mifare_checkins').document()
    doc_ref.set({
        u'checkedIn': datetime.datetime.now(),
        u'checkInType': u'attendance',
        u'mifareId': uid,
        u'verified': "null"
    })
    print("datetime.datetime.now()")
    print(datetime.datetime.now())
    print ("uid")
    print (uid)

    

while True:
    try:
        uid = mifare.select()
        print(uid)
        writeToFireStore(uid)
    except nxppy.SelectError:
        # SelectError is raised if no card is in the field.
        pass

    sleep(1)

