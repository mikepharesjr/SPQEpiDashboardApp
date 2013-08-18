var oDB;
var oMiniEpiDashboardListLoaded = false;
var goToEmailReportsListLoaded = false;

var oJQTouch = $.jQTouch({
    statusBar: 'black-translucent',
    useAnimations: true,
    fixedViewport: false,
    cacheGetRequests: false,
    addGlossToIcon: false,
    themeSelectionSelector: '#oHome #oThemes ul',
    preloadImages: []
});

var oPictureSource;
var oDestinationType;

document.addEventListener("deviceready", onDeviceReady, false);

$(document).ready(initBasic);

function initBasic() {
    var oResults = false;
    try {
        updateLog("initBasic Entry");
        localStorage.oEpiDashboard = "SUMCO-SPQ-Epi_Dashboard";
        localStorage.oEpiDashboardVersion = "1.0.000";
        //$.get("config.xml", function (oData) {
        //    var oLiteralValues = oData.substr(0, 350).split("\"");
        //    localStorage.oEpiDashboard = oLiteralValues[9];
        //    localStorage.oEpiDashboardVersion = oLiteralValues[3];
        //    document.getElementById("oRev").innerText = localStorage.oEpiDashboardVersion;
        //    //localStorage.oEpiDashboard = oLiteralValues[13];
        //    //localStorage.oEpiDashboardVersion = oLiteralValues[5];
        //    oData = null; oLiteralValues = null;
        //});
        localStorage.oLanAddress = "http://192.168.174.50:8181/WebGet/Query/";
        localStorage.oWanAddress = "http://71.210.249.143:8181/WebGet/Query/";
        if (!localStorage.oUsername) { localStorage.oUsername = ""; }
        if (!localStorage.oPassword) { localStorage.oPassword = ""; }
        if (!localStorage.oDisplayName) { localStorage.oDisplayName = ""; }
        if (!localStorage.oIsAdmin) { localStorage.oIsAdmin = "N"; }
        if (!localStorage.oUseLanAddress) { localStorage.oUseLanAddress = false; }
        if (!localStorage.oLastForcedUpdate) { localStorage.oLastForcedUpdate = ""; }
        if (localStorage.oDisplayName != "") { updateWelcomeInfo(); }
        initDataBase();
        initAppInfo(true);
        initAppInfo(false);
        initExtraJavaFunctions();
        updateLog("initBasic Exit");
    }
    catch (oErr) { updateLog(oErr.message); }
    return oResults;
}

function initDataBase() {
    var oResults = false;
    try {
        updateLog("initDataBase Entry");
        if (typeof (openDatabase) === 'function') {
            updateLog("initDataBase True");
            var oDataBaseName = 'SPQ';
            var oVersion = '1.1';
            var oDisplayName = 'SPQ';
            var oMaxSize = 65536;
            var oMiniEpiDashboardListSql = "create table if not exists MiniEpiDashboardList (id integer not null primary key autoincrement, SubType text, Timestamp text);";
            var oEmailReportsList = "create table if not exists EmailReportsList (id integer not null primary key autoincrement, Grouping text, Name text, MonitoringDescription text);";
            oDB = openDatabase(oDataBaseName, oVersion, oDisplayName, oMaxSize);
            oDB.transaction(function (oCommand) { oCommand.executeSql(oMiniEpiDashboardListSql); });
            oDB.transaction(function (oCommand) { oCommand.executeSql(oEmailReportsList); });
        }
        updateLog("initDataBase Exit");
    }
    catch (oErr) { updateLog(oErr.message); }
    return oResults;
}

function initAppInfo(oTestLanConnection) {
    var oResults = false;
    try {
        var oDate = new Date();
        var oHost = localStorage.oWanAddress;
        if (oTestLanConnection == true || oTestLanConnection == "true") { oHost = localStorage.oLanAddress; }
        var oURL = oHost + "GetPhoneGapAppInfo" + "?NowTicks=" + oDate.toJSON() + "&" + "callback=?" //must end with callback=?
        $.getJSON(oURL, function (oData, oStatus, oXMLHttpRequest) {
            if (oTestLanConnection == true || oTestLanConnection == "true") { localStorage.oUseLanAddress = true; }
            if (oTestLanConnection == false || oTestLanConnection == "false") { localStorage.oUseLanAddress = false; }
            $.each(oData, function (oCount, oRow) {
                //console.log(oRow);
                if (localStorage.oEpiDashboard == oRow.C01) {
                    if (localStorage.oLastForcedUpdate != oRow.C02) { populateTables(); }
                    localStorage.oLastForcedUpdate = oRow.C02;
                }
            });
        });
    }
    catch (oErr) { updateLog(oErr.message); }
    return oResults;
}

function initExtraJavaFunctions() {
    var oResults = false;
    try {
        updateLog("initExtraJavaFunctions Entry");
        $(function () {
            $('a[target="_blank"]').bind('click', function () { if (confirm('This link opens in a new window.')) { return true; } else { return false; } });
            //$('a[title="Results"]').bind('click', function (event) { clearResults(event.target || event.srcElement); });
            $('#mikepharesjr').bind('turn', function (e, data) {
                $('#orient').html('Orientation: ' + data.orientation);
            });
            $('#pageevents').
                bind('pageAnimationStart', function (e, info) {
                    $(this).find('.info').append('Started animating ' + info.direction + '&hellip;  And the link ' +
                        'had this custom data: ' + $(this).data('referrer').data('custom') + '<br>');
                }).
                bind('pageAnimationEnd', function (e, info) {
                    $(this).find('.info').append('Finished animating ' + info.direction + '.<br><br>');
                });
            $('#callback').bind('pageAnimationEnd', function (e, info) {
                if (!$(this).data('loaded')) {
                    $(this).append($('<div>Loading</div>').load('ajax.html .info', function () {
                        $(this).parent().data('loaded', true);
                    }));
                }
            });
            $('#swipeme').swipe(function (evt, data) {
                var details = !data ? '' : '<strong>' + data.direction + '/' + data.deltaX + ':' + data.deltaY + '</strong>!';
                $(this).html('You swiped ' + details);
                $(this).parent().after('<li>swiped!</li>')
            });
            $('#tapme').tap(function () {
                $(this).parent().after('<li>tapped!</li>')
            });
        });
        updateLog("initExtraJavaFunctions Exit");
    }
    catch (oErr) { updateLog(oErr.message); }
    return oResults;
}

function onDeviceReady() {
    var oResults = false;
    try {
        updateLog("onDeviceReady Entry");
        try {
            document.addEventListener("menubutton", goToSettings, false);
            document.addEventListener("searchbutton", goToAbout, false);
        }
        catch (oErr) { updateLog(oErr.message); }
        try {
            oPictureSource = navigator.camera.PictureSourceType;
            oDestinationType = navigator.camera.DestinationType;
        }
        catch (oErr) { updateLog(oErr.message); }
        updateLog("onDeviceReady Exit");
    }
    catch (oErr) { updateLog(oErr.message); }
    return oResults;
}

function saveSettings() {
    var oResults = false;
    try {
        updateLog("saveSettings Entry");
        localStorage.oUsername = document.getElementById("oUsername").value;
        localStorage.oPassword = document.getElementById("oPassword").value;
        //if (document.getElementById("oASDF").checked == true) { localStorage.oASDF = true; }
        oJQTouch.goBack();
        updateLog("saveSettings Exit");
    }
    catch (oErr) { updateLog(oErr.message); }
    return oResults;
}

function updateLog(oMessage) {
    var oResults = false;
    try { $("<li/>").text(oMessage).appendTo("#oLogList"); }
    catch (oErr) { alert(oErr.message); }
    return oResults;
}

function getHost() { var oResults = localStorage.oWanAddress; if (localStorage.oUseLanAddress == true || localStorage.oUseLanAddress == "true") { oResults = localStorage.oLanAddress; } return oResults; }

function initHttpContextInfo(oTestLanConnection) {
    var oResults = false;
    try {
        var oDate = new Date();
        var oURL = getHost() + "GetHttpContextInfo" + "?NowTicks=" + oDate.toJSON() + "&" + "callback=?" //must end with callback=?
        $.getJSON(oURL, function (oData, oStatus, oXMLHttpRequest) {
            $.each(oData, function (oCount, oRow) {
                //console.log(oRow);
                updateLog(JsonServerUsername + "{" + oRow.C01 + "} " + JsonServerIp + "{" + oRow.C02 + "}");
            });
        });
    }
    catch (oErr) { updateLog(oErr.message); }
    return oResults;
}

function getUtilizationEventForSubTypeFromDC(oSubType) {
    var oResults = false;
    try {
        var oDate = new Date();
        document.getElementById("oMiniEpiDashboardResultsList").innerHTML = "";
        oJQTouch.goTo('#oMiniEpiDashboardResults', 'slidleft');
        if (localStorage.oUsername.length < 3) {
            document.getElementById("oMiniEpiDashboardResultsList").innerHTML = "<li>Please update your Username in the settings first. {" + oDate.toJSON() + "}</li>";
        } else {
            document.getElementById("oMiniEpiDashboardResultsList").innerHTML = "<li>Loading data for {" + oSubType + "} Please wait... {" + oDate.toJSON() + "}</li>";
            var oURL = getHost() + "GetUtilizationEventForSubTypeFromDC" + "?SubType=" + oSubType + "&NowTicks=" + oDate.toJSON() + "&" + "callback=?" //must end with callback=?
            $.getJSON(oURL, function (oData, oStatus, oXMLHttpRequest) {
                document.getElementById("oMiniEpiDashboardResultsList").innerHTML = "";
                $.each(oData, function (oCount, oRow) {
                    $("<li/>")
                        .text(oRow.C01 + " " + oRow.C02 + " " + oRow.C03 + " " + oRow.C04 + " " + oRow.C05 + " " + oRow.C06 + " " + oRow.C07)
                        .css({ color: oRow.C08 })
                        .appendTo("#oMiniEpiDashboardResultsList");
                });
            });
        }
    }
    catch (oErr) { updateLog(oErr.message); }
    return oResults;
}

function checkUserName() {
    var oResults = false;
    try {
        var oUsername = document.getElementById("oUsername");
        if (!oUsername) {
            updateLog("Couldn't get the oUsername Object.");
        }
        else {
            if (oUsername.value == "") {
                updateLog("oUsername is empty after lost focus.");
            } else {
                oUsername.value = oUsername.value.toUpperCase();
                getOperatorInfo();
            }
        }
    }
    catch (oErr) { updateLog(oErr.message); }
}

function getOperatorInfo() {
    var oResults = false;
    try {
        var oUsername = document.getElementById("oUsername");
        if (!oUsername) {
            updateLog("Couldn't get the oUsername Object.");
        }
        else {
            var oDate = new Date();
            var oURL = getHost() + "GetOperatorInfo" + "?Username=" + oUsername.value.toUpperCase() + "&NowTicks=" + oDate.toJSON() + "&" + "callback=?" //must end with callback=?
            $.getJSON(oURL, function (oData) {
                var oValidUsername;
                $.each(oData, function (oCount, oRow) {
                    //console.log(oRow);
                    oValidUsername = true;
                    localStorage.oUsername = oRow.C01;
                    localStorage.oDisplayName = oRow.C02;
                    localStorage.oIsOperator = oRow.C03;
                    localStorage.oIsLead = oRow.C04;
                    localStorage.oExcursion = oRow.C05;
                    localStorage.oIsAdmin = oRow.C06;
                    localStorage.oCreatedDate = oRow.C07;
                    localStorage.oLastUpdated = oRow.C08;
                    updateWelcomeInfo();
                });
                if (oValidUsername != true && oValidUsername != "true") {
                    oUsername.value = "";
                    alert("Not a valid Username. Please try agian.");
                }
            });
        }
    }
    catch (oErr) { updateLog(oErr.message); }
    return oResults;
}

function updateWelcomeInfo() {
    var oResults = false;
    try {
        document.getElementById("oWelcomeInfo").innerHTML = "Welcome back " + localStorage.oDisplayName;
    }
    catch (oErr) { updateLog(oErr.message); }
}

//function clearResults(oTarget) {
//    var oResults = false;
//    try {
//        switch (oTarget.id.toUpperCase()) {
//            case "oMiniEpiDashboardResultsBackButton".toUpperCase(): document.getElementById("oMiniEpiDashboardResultsList").innerHTML = ""; break;
//            default: throw "Case else for {" + oTarget.id + "}";
//        }
//    }
//    catch (oErr) { updateLog(oErr.message); }
//}

function populateMiniEpiDashboardTable() {
    var oResults = false;
    try {
        var oSql = "delete from MiniEpiDashboardList where id<>?;";
        oDB.transaction(function (oCommand) {
            oCommand.executeSql(oSql, [0], function () {
                var oDate = new Date();
                var oURL = getHost() + "GetUtilizationEventSubTypes" + "?NowTicks=" + oDate.toJSON() + "&" + "callback=?" //must end with callback=?
                $.getJSON(oURL, function (oData, oStatus, oXMLHttpRequest) {
                    var oTemp = document.getElementById("oMiniEpiDashboardList")
                    if (!oTemp) {
                        updateLog("Failed to get oMiniEpiDashboardList.")
                    } else {
                        oSql = "insert into MiniEpiDashboardList (SubType, Timestamp) values (?, ?);";
                        $.each(oData, function (oCount, oRow) {
                            //console.log(oRow);
                            oDB.transaction(function (oCommand) { oCommand.executeSql(oSql, [oRow.C01, oRow.C02], null, function () { updateLog("Failed to insert into MiniEpiDashboardList"); }); });
                        });
                    }
                });
            }, function () { updateLog("Failed to delete MiniEpiDashboardList."); });
        });
    }
    catch (oErr) { updateLog(oErr.message); }
}

function populateEmailReportsTable() {
    var oResults = false;
    try {
        var oSql = "delete from EmailReportsList where id<>?;";
        oDB.transaction(function (oCommand) {
            oCommand.executeSql(oSql, [0], function () {
                var oDate = new Date();
                var oURL = getHost() + "GetReportList" + "?NowTicks=" + oDate.toJSON() + "&" + "callback=?" //must end with callback=?
                $.getJSON(oURL, function (oData, oStatus, oXMLHttpRequest) {
                    var oTemp = document.getElementById("oEmailReportsList")
                    if (!oTemp) {
                        updateLog("Failed to get oEmailReportsList.")
                    } else {
                        oSql = "insert into EmailReportsList (Grouping, Name, MonitoringDescription) values (?, ?, ?);";
                        $.each(oData, function (oCount, oRow) {
                            //console.log(oRow);
                            oDB.transaction(function (oCommand) { oCommand.executeSql(oSql, [oRow.C01, oRow.C02, oRow.C03], null, function () { updateLog("Failed to insert into EmailReportsList"); }); });
                        });
                    }
                });
            }, function () { updateLog("Failed to delete EmailReportsList."); });
        });
    }
    catch (oErr) { updateLog(oErr.message); }
}

function populateTables() {
    var oResults = false;
    try {
        if (!oDB) { updateLog("No Database."); } else {
            populateMiniEpiDashboardTable();
            populateEmailReportsTable();
            updateLog("TODO ...."); //populateLists();
        }
    }
    catch (oErr) { updateLog(oErr.message); }
}

function goToMiniEpiDashboard() {
    var oResults = false;
    try {
        var oHTML = "";
        if (!oDB) {
            oHTML = oHTML + "<li class=\"arrow\" onclick=\"getUtilizationEventForSubTypeFromDC('" + "ASM" + "');\">" + "ASM" + "</li>";
            oHTML = oHTML + "<li class=\"arrow\" onclick=\"getUtilizationEventForSubTypeFromDC('" + "Centura" + "');\">" + "Centura" + "</li>";
            document.getElementById("oMiniEpiDashboardList").innerHTML = oHTML;
        } else {
            if (oMiniEpiDashboardListLoaded == false || oMiniEpiDashboardListLoaded == "false") {
                oMiniEpiDashboardListLoaded = true;
                var oSql = "select SubType from MiniEpiDashboardList where id>?";
                oDB.transaction(function (oCommand) {
                    oCommand.executeSql(oSql, [0], function (oCommand, oData) {
                        var oRow;
                        for (var i = 0; i < oData.rows.length; i++) {
                            oRow = oData.rows.item(i);
                            switch (oRow.SubType.toUpperCase()) {
                                case "MOSCAP".toUpperCase(): break;
                                default: oHTML = oHTML + "<li class=\"arrow\" onclick=\"getUtilizationEventForSubTypeFromDC('" + oRow.SubType + "');\">" + oRow.SubType + "</li>";
                            }
                        }
                        document.getElementById("oMiniEpiDashboardList").innerHTML = oHTML;
                    }, function (oCommand, oErr) { updateLog(oErr.message + "Failed to select from MiniEpiDashboardList."); });
                });
            }
        }
        oJQTouch.goTo('#oMiniEpiDashboard', 'slideleft');
    }
    catch (oErr) { updateLog(oErr.message); }
}

function goToEmailReports() {
    var oResults = false;
    try {
        var oHTML = "";
        if (!oDB) {
            oHTML = oHTML + "<li class=\"arrow\" onclick=\"getASDF('" + "oRow.Name" + "');\">" + "oRow.Name" + " " + "oRow.Grouping" + " " + "oRow.MonitoringDescription" + "</li>";
            document.getElementById("oEmailReportsList").innerHTML = oHTML;
        } else {
            if (goToEmailReportsListLoaded == false || goToEmailReportsListLoaded == "false") {
                goToEmailReportsListLoaded = true;
                var oSql = "select Grouping, Name, MonitoringDescription from EmailReportsList where id>?";
                oDB.transaction(function (oCommand) {
                    oCommand.executeSql(oSql, [0], function (oCommand, oData) {
                        var oRow;
                        for (var i = 0; i < oData.rows.length; i++) {
                            oRow = oData.rows.item(i);
                            oHTML = oHTML + "<li class=\"arrow\" onclick=\"getASDF('" + oRow.Name + "');\">" + oRow.Name + " " + oRow.Grouping + " " + oRow.MonitoringDescription + "</li>";
                        }
                        document.getElementById("oEmailReportsList").innerHTML = oHTML;
                    }, function (oCommand, oErr) { updateLog(oErr.message + "Failed to select from EmailReportsList."); });
                });
            }
        }
        oJQTouch.goTo('#oEmailReports', 'slideleft');
    }
    catch (oErr) { updateLog(oErr.message); }
}

function goToAbout() {
    var oResults = false;
    try { oJQTouch.goTo('#oAbout', 'slideleft'); }
    catch (oErr) { updateLog(oErr.message); }
}

function goToLog() {
    var oResults = false;
    try { oJQTouch.goTo('#oLog', 'slideup'); }
    catch (oErr) { updateLog(oErr.message); }
}

function goToSettings() {
    var oResults = false;
    try {
        document.getElementById("oUsername").value = localStorage.oUsername;
        document.getElementById("oPassword").value = localStorage.oPassword;
        //document.getElementById("oASDF").checked = false;
        //if (localStorage.oASDF == true || localStorage.oASDF == "true") { document.getElementById("oASDF").checked = true; }
        document.getElementById("oSettingsInfo").innerHTML = localStorage.oLastForcedUpdate;
        oJQTouch.goTo('#oSettings', 'slideup');
    }
    catch (oErr) { updateLog(oErr.message); }
}

function goToHome(oAnimation) {
    var oResults = false;
    try { oJQTouch.goTo('#oHome', oAnimation); }
    catch (oErr) { updateLog(oErr.message); }
}

function goToHomeThenMiniEpiDashboard() {
    var oResults = false;
    try {
        oJQTouch.goTo('#oHome', 'slideright');
        oJQTouch.goTo('#oMiniEpiDashboard', 'slideleft');
    }
    catch (oErr) { updateLog(oErr.message); }
}

function onPhotoDataSuccess(oImageData) {
    var oResults = false;
    try {
        document.getElementById('oASDF').src = "data:image/jpeg;base64," + oImageData;
    }
    catch (oErr) { updateLog(oErr.message); }
}

function onPhotoDataError(oError) {
    var oResults = false;
    try { updateLog("Message: " + oError); }
    catch (oErr) { updateLog(oErr.message); }
}

function capturePhoto() {
    var oResults = false;
    try {
        //$('#spinwrap').fadeIn(500);
        navigator.camera.getPicture(onPhotoDataSuccess, onPhotoDataError, { quality: 50 });
    }
    catch (oErr) { updateLog(oErr.message); }
}

function onPhotoURISuccess(oImageURI) {
    var oResults = false;
    try {
        document.getElementById('oASDF').src = oImageURI;
    }
    catch (oErr) { updateLog(oErr.message); }
}

function onPhotoURIError(oError) {
    var oResults = false;
    try { updateLog("Message: " + oError); }
    catch (oErr) { updateLog(oErr.message); }
}

function getPhoto() {
    var oResults = false;
    try {
        oSource = pictureSource.PHOTOLIBRARY;
        navigator.camera.getPicture(onPhotoURISuccess, onPhotoURIError, { quality: 50, destinationType: destinationType.FILE_URI, sourceType: oSource });
    }
    catch (oErr) { updateLog(oErr.message); }
}

function onCurrentPositionSuccess(oPosition) {
    var oResults = false;
    try {
        updateLog("Your current location: Latitude ~ {" + oPosition.coords.latitude + "} Longitude ~ {" + oPosition.coords.longitude + "}");
        //var oLatLng = new google.maps.LatLng(oPosition.coords.latitude, oPosition.coords.longitude);
    }
    catch (oErr) { updateLog(oErr.message); }
}

function onCurrentPositionError(oError) {
    var oResults = false;
    try { updateLog("Code: " + oError.code + " Message: " + oError.message); }
    catch (oErr) { updateLog(oErr.message); }
}

function getCurrentPosition() {
    var oResults = false;
    try { navigator.geolocation.getCurrentPosition(onCurrentPositionSuccess, onCurrentPositionError); }
    catch (oErr) { updateLog(oErr.message); }
}

function onAccelerationSuccess(oAcceleration) {
    var oResults = false;
    try {
        alert('Acceleration X: ' + acceleration.x + '\n' +
              'Acceleration Y: ' + acceleration.y + '\n' +
              'Acceleration Z: ' + acceleration.z + '\n' +
              'Timestamp:    ' + acceleration.timestamp + '\n');
    }
    catch (oErr) { updateLog(oErr.message); }
}

function onAccelerationError() {
    var oResults = false;
    try { updateLog("Couldn't retrive Acceleration info."); }
    catch (oErr) { updateLog(oErr.message); }
}

function getCurrentAcceleration() {
    var oResults = false;
    try {
        navigator.accelerometer.getCurrentAcceleration(onAccelerationSuccess, onAccelerationError);
    }
    catch (oErr) { updateLog(oErr.message); }
}

function updateX() {
    var oResults = false;
    try { }
    catch (oErr) { updateLog(oErr.message); }
}