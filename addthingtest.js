var active_things = {
    "/place": {
        "place/1": {
            "name": "Home",
            "status": "green",
            "info": {
                "pairing": "on",
                "strict": "off",
                "displayUnits": "customary",
                "review": [],
                "monitoring": "idle",
                "version": "commit 8b0870c87 from last month",
                "solar": "no location",
                "identity": "2f402f80-da50-11e1-9b23-0013efd023ef"
            },
            "updated": "2014-08-03T15:58:37.979Z"
        }
    },
    "/device/switch/wemo/onoff": {
        "device/2": {
            "name": "Fan",
            "status": "off",
            "info": {},
            "updated": "2014-08-03T15:58:37.979Z"
        }
    },
    "/group": {
        "group/1": {
            "uuid": "LivingRoom1",
            "name": "Living Room",
            "comments": "",
            "type": "device",
            "operator": "and",
            "members": [
                "device/9",
                "device/8"
            ]
        },
        "group/2": {
            "uuid": "Bedroom1",
            "name": "Bedroom",
            "comments": "",
            "type": "device",
            "operator": "and",
            "members": [
                "device/7"
            ]
        }
    }
}

var element = {
    "whatami": "/device/switch/zwave/dimmer",
    "whoami": "device/6",
    "name": "CA600 Wall Dimmer",
    "status": "on",
    "info": {},
    "updated": 1407081582857
}

                    var thing = {};
                    thing[element.whoami] = {
                        name: element.name,
                        status: element.status,
                        info: element.info,
                        updated: element.updated
                    }

                    active_things[element.whatami] = thing;

console.log(JSON.stringify(active_things,null,4));

