"use strict";
var fs = require('fs');
var cities;
var countries;
fs.readFile('app_data/country.json', 'utf8', function (err, data) {
    if (err)
        throw err;
    cities = JSON.parse(data);
    countries = getCountries();
});
function index(req, res) {
    res.render('index', { title: 'Express', year: new Date().getFullYear() });
}
exports.index = index;
;
function getcountries(req, res) {
    res.send(countries);
}
exports.getcountries = getcountries;
;
function checkforpermission(req, res) {
    checkPermissionOfDistributor(req, res);
}
exports.checkforpermission = checkforpermission;
;
function checkPermissionOfDistributor(req, res) {
    try {
        var selectedCountryCode = req.query.country;
        var selectedProvinceCode = req.query.province;
        var selectedCityCode = req.query.city;
        var selectedDistributorId = req.query.distributor;
        fs.readFile('app_data/distributorPermission.json', 'utf8', function (err, data) {
            if (err)
                throw err;
            var distributorPermission = JSON.parse(data);
            var listOfSelectedDistributorInclude = [];
            var listOfSelectedDistributorExclude = [];
            var targetDistributorDetail = getDistributorDetailById(distributorPermission, selectedDistributorId);
            while (targetDistributorDetail !== null) {
                for (var i = 0; i < targetDistributorDetail.INCLUDE.length; i++) {
                    listOfSelectedDistributorInclude.push(targetDistributorDetail.INCLUDE[i]);
                }
                for (var i = 0; i < targetDistributorDetail.EXCLUDE.length; i++) {
                    listOfSelectedDistributorExclude.push(targetDistributorDetail.EXCLUDE[i]);
                }
                targetDistributorDetail = getDistributorDetailById(distributorPermission, targetDistributorDetail.PDI);
            }
            for (var i = 0; i < listOfSelectedDistributorInclude.length; i++) {
                if (selectedCountryCode === listOfSelectedDistributorInclude[i].Country_Code) {
                    for (var j = 0; j < listOfSelectedDistributorExclude.length; j++) {
                        if (selectedProvinceCode === listOfSelectedDistributorExclude[j].Province_Code) {
                            for (var k = 0; k < listOfSelectedDistributorExclude.length; k++) {
                                if (selectedCityCode === listOfSelectedDistributorExclude[k].City_Code) {
                                    res.send({ "Response": false });
                                    return;
                                }
                            }
                            if (listOfSelectedDistributorExclude[j].City_Code === '') {
                                res.send({ "Response": false });
                                return;
                            }
                            else {
                                res.send({ "Response": true });
                                return;
                            }
                        }
                    }
                    var count = -1;
                    for (var j = 0; j < listOfSelectedDistributorInclude.length; j++) {
                        if (listOfSelectedDistributorInclude[j].Province_Code !== '') {
                            count++;
                        }
                        if (listOfSelectedDistributorInclude[j].Province_Code === selectedProvinceCode) {
                            var count2 = -1;
                            for (var l = 0; l < listOfSelectedDistributorInclude.length; l++) {
                                if (listOfSelectedDistributorInclude[l].City_Code != '') {
                                    count2++;
                                }
                                if (listOfSelectedDistributorInclude[l].City_Code == selectedCityCode) {
                                    res.send({ "Response": true });
                                    return;
                                }
                            }
                            if (count2 == -1) {
                                res.send({ "Response": true });
                                return;
                            }
                            else {
                                res.send({ "Response": false });
                                return;
                            }
                        }
                    }
                    if (count == -1) {
                        res.send({ "Response": true });
                        return;
                    }
                    else {
                        res.send({ "Response": false });
                        return;
                    }
                }
                if (i == listOfSelectedDistributorInclude.length) {
                    res.send({ "Response": false });
                    return;
                }
            }
            res.send({ "Response": false });
            return;
        });
    }
    catch (exception) {
        res.writeHead(500);
        res.write(exception.toString());
        res.end();
    }
}
exports.checkPermissionOfDistributor = checkPermissionOfDistributor;
function getDistributorDetailById(argDistributorlist, argSelectedDistributorId) {
    for (var i = 0; i < argDistributorlist.length; i++) {
        if (argDistributorlist[i].Id == argSelectedDistributorId) {
            return argDistributorlist[i];
        }
    }
    return null;
}
function getprovinces(req, res) {
    try {
        var selectedCountryCode = req.query.country;
        var clientResponse = getProvicesOfSelectedCountry(selectedCountryCode);
        res.send(clientResponse);
    }
    catch (exception) {
        res.writeHead(500);
        res.write(exception.toString());
        res.end();
    }
}
exports.getprovinces = getprovinces;
;
function getcities(req, res) {
    try {
        var selectedCountryCode = req.query.country;
        var selectedProvinceCode = req.query.province;
        var clientResponse = getCitiesOfSelectedCountry(selectedCountryCode, selectedProvinceCode);
        res.send(clientResponse);
    }
    catch (exception) {
        res.writeHead(500);
        res.write(exception.toString());
        res.end();
    }
}
exports.getcities = getcities;
;
function getCountries() {
    var targetCountries = [];
    for (var i = 0; i < cities.length; i++) {
        var targetOject = { "Country_Code": cities[i].Country_Code, "Country_Name": cities[i].Country_Name };
        for (var j = 0; j < targetCountries.length; j++) {
            if (targetOject.Country_Code === targetCountries[j].Country_Code) {
                break;
            }
        }
        if (j == targetCountries.length)
            targetCountries.push(targetOject);
    }
    return targetCountries;
}
function getProvicesOfSelectedCountry(argSelectedCountryCode) {
    var targetProvinces = [];
    for (var i = 0; i < cities.length; i++) {
        if (cities[i].Country_Code !== argSelectedCountryCode)
            continue;
        var targetOject = { "Province_Code": cities[i].Province_Code, "Province_Name": cities[i].Province_Name };
        for (var j = 0; j < targetProvinces.length; j++) {
            if (targetOject.Province_Code === targetProvinces[j].Province_Code) {
                break;
            }
        }
        if (j == targetProvinces.length)
            targetProvinces.push(targetOject);
    }
    return targetProvinces;
}
function getCitiesOfSelectedCountry(argSelectedCountryCode, argSelectedProvinceCode) {
    var targetCities = [];
    for (var i = 0; i < cities.length; i++) {
        if (cities[i].Country_Code === argSelectedCountryCode && cities[i].Province_Code === argSelectedProvinceCode) {
            var targetOject = { "City_Code": cities[i].City_Code, "City_Name": cities[i].City_Name };
            targetCities.push(targetOject);
        }
    }
    return targetCities;
}
//# sourceMappingURL=index.js.map
