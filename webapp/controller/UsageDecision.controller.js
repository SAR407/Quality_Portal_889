sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, UIComponent, History, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("qualityportal.controller.UsageDecision", {
        onInit: function () {
            var oViewModel = new JSONModel({
                isBalanced: false,
                totalRecorded: 0
            });
            this.getView().setModel(oViewModel, "viewModel");

            var oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteUsageDecision").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sInternalId = oEvent.getParameter("arguments").InspectionLot;
            // Handle correct key format logic if needed, assuming backend accepts string
            var sPath = "/ZCDS_QP_INSPECTION_889('" + sInternalId + "')";

            this.getView().bindElement({
                path: sPath,
                model: "inspectionModel",
                events: {
                    dataReceived: function (oData) {
                        if (oData) {
                            var oEntity = oData.getParameter("data");
                            this._validateBalance(oEntity);
                        }
                    }.bind(this)
                }
            });
        },

        _validateBalance: function (oEntity) {
            if (!oEntity) return;

            var u = parseFloat(oEntity.UnrestrictedQty) || 0;
            var b = parseFloat(oEntity.BlockedQty) || 0;
            var p = parseFloat(oEntity.ProductionQty) || 0;
            var total = u + b + p;
            var lotQty = parseFloat(oEntity.LotQuantity) || 0;

            this.getView().getModel("viewModel").setProperty("/totalRecorded", total);

            // Strict FRS check: Unrestricted + Block + Production = LotQuantity
            if (total === lotQty) {
                this.getView().getModel("viewModel").setProperty("/isBalanced", true);
            } else {
                this.getView().getModel("viewModel").setProperty("/isBalanced", false);
                // If the user somehow navigated here without balance, we should probably warn or lock
            }
        },

        onApprove: function () {
            this._postDecision("A");
        },

        onReject: function () {
            this._postDecision("R");
        },

        _postDecision: function (sCode) {
            var oModel = this.getView().getModel("inspectionModel");
            var oContext = this.getView().getBindingContext("inspectionModel");

            // FRS: Change decision from PENDING to 'A' or 'R'
            oModel.setProperty("UsageDecisionCode", sCode, oContext);

            sap.ui.core.BusyIndicator.show(0);
            oModel.submitChanges({
                success: function () {
                    sap.ui.core.BusyIndicator.hide();
                    var sMsg = (sCode === 'A') ? "Inspection Approved." : "Inspection Rejected.";
                    MessageToast.show(sMsg);

                    // FRS: Navigate back, lot should now be read-only in the list
                    var oRouter = UIComponent.getRouterFor(this);
                    oRouter.navTo("RouteInspectionLot");
                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Error posting decision. Please try again.");
                }
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteInspectionLot", {}, true);
            }
        }
    });
});
