sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "qualityportal/model/formatter"
], function (Controller, UIComponent, History, formatter) {
    "use strict";

    return Controller.extend("qualityportal.controller.InspectionLot", {
        formatter: formatter,

        onInit: function () {
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteDashboard", {}, true);
            }
        },

        onPressLot: function (oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext("inspectionModel");

            // Debugging context
            console.log("Selected Context Object:", oContext.getObject());

            // Try both cases as backend might be different
            var sInspectionLot = oContext.getProperty("InspectionLot")
                || oContext.getProperty("inspectionLot")
                || oContext.getProperty("inspection_lot"); // Just in case

            if (!sInspectionLot) {
                // If nothing found, try to alert keys of the object to help debug
                var aKeys = Object.keys(oContext.getObject());
                console.error("Available keys:", aKeys);
                sap.m.MessageToast.show("Error: ID not found. Keys: " + aKeys.join(", "));
                return;
            }

            // Visual confirmation
            sap.m.MessageToast.show("Navigating to Lot: " + sInspectionLot);

            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteResultRecording", {
                InspectionLot: sInspectionLot
            });
        }
    });
});
