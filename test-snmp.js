var snmp = require('snmp-native');

//var hostname = 'toshiba2555c';
//var hostname = '192.168.0.248';
//var hostname = 'xerox5325';
var hostname = 'cube';
var session = new snmp.Session({host: hostname});

const printerErrorOID = [ 1, 3, 6, 1, 2, 1, 25, 3,  5, 1, 2, 1 ];
const sysObjectOID =   [ 1, 3, 6, 1, 2, 1, 1, 2, 0 ]; 
const deviceDescOID = [ 1, 3, 6, 1, 2, 1, 25, 3,  2, 1, 3, 1 ];

var MIBErrorCodes = ['lowPaper', 'noPaper', 'lowToner', 'noToner',
                   'doorOpen', 'jammed', 'offline', 'serviceRequested',
                   'inputTrayMissing', 'outputTrayMissing', 'markerSupplyMissing',
                   'outputNearFull', 'outputFull', 'inputTrayEmpty',
                   'overduePreventMaint'];
/*
 * Printer MIB definitions for error codes:
 * lowPaper             0
 * noPaper              1
 * lowToner             2
 * noToner              3
 * doorOpen             4
 * jammed               5
 * offline              6
 * serviceRequested     7
 * inputTrayMissing     8
 * outputTrayMissing    9
 * markerSupplyMissing 10
 * outputNearFull      11
 * outputFull          12
 * inputTrayEmpty      13
 * overduePreventMaint 14
 */

/**
 * Take a 2 byte SNMP error data and convert to error
 * code strings.
 */
function convertSNMPErrorToCodes(error) {
    var str = "";
    for (var i = 0; i < 15; i++) {
        if ((error & (1 << i)) > 0) {
            if (i <= 7) {
                str += (MIBErrorCodes[7-i] + " ");
            } else {
                str += (MIBErrorCodes[23-i] + " ");
            }
        }
    }//for
    return str;
}

function getDataCallback(error, varbinds) {
    console.log("Get data callback");

    if (error) {
        console.log('Fail :(');
	return;
    }
    for (var i = 0; i < varbinds.length; i++) {
        var vb = varbinds[i];
        if (vb.oid.toString() === printerErrorOID.toString()) { 
            console.log("error value: " + vb.valueHex);
            var buffer = vb.valueRaw;
            var num;
            if (buffer.length < 1) {
                num = 0;
            } else if (buffer.length == 1) {
                console.log("1 byte");
                num = buffer.readUInt8(0);
            } else {
                console.log("2 bytes");
                num = buffer.readUInt16LE(0);
            }
            var errors = convertSNMPErrorToCodes(num);
            console.log("error string: " + errors);
        } else if (vb.oid.toString() === deviceDescOID.toString()) {
            console.log(vb.oid + ' = ' + vb.value + ' (' + vb.type + ')');
        }
    }
}

console.log(convertSNMPErrorToCodes(7));

console.log("Get data for host: " + hostname);
var oids = [ printerErrorOID, deviceDescOID ];
console.log("About to call getall...");
session.getAll({ oids: oids }, getDataCallback);
