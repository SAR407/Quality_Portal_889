sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
    "use strict";

    return Controller.extend("qualityportal.controller.Dashboard", {
        onInit: function () {
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        onPressInspectionLots: function () {
            this.getRouter().navTo("RouteInspectionLot");
        },

        onPressResultRecording: function () {
            // Navigating to Inspection Lot list, but potentially could pass a query parm to filter
            this.getRouter().navTo("RouteInspectionLot");
        },

        onPressUsageDecision: function () {
            // Navigating to Inspection Lot list, but potentially could pass a query parm to filter
            this.getRouter().navTo("RouteInspectionLot");
        },

        onLogout: function () {
            // Navigate back to Login
            this.getRouter().navTo("RouteLogin", {}, true); // true to replace history
            sap.m.MessageToast.show("Logged out successfully.");
        }
    });
});
