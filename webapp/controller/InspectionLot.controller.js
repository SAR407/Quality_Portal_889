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
            var sInspectionLot = oContext.getProperty("InspectionLot");

            var oRouter = UIComponent.getRouterFor(this);
            // Navigate to Result Recording by default when clicking a lot
            oRouter.navTo("RouteResultRecording", {
                InspectionLot: sInspectionLot
            });
        }
    });
});
