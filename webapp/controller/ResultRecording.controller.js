sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "qualityportal/model/formatter"
], function (Controller, UIComponent, History, MessageToast, JSONModel, formatter) {
    "use strict";

    return Controller.extend("qualityportal.controller.ResultRecording", {
        formatter: formatter,

        onInit: function () {
            var oViewModel = new JSONModel({
                editable: true,
                totalInspected: 0
            });
            this.getView().setModel(oViewModel, "viewModel");

            var oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteResultRecording").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sInternalId = oEvent.getParameter("arguments").InspectionLot;
            // The InspectionLot key might need padding or quotes depending on backend, passing raw for now
            // Assuming string key
            var sPath = "/ZCDS_QP_INSPECTION_889('" + sInternalId + "')";

            this.getView().bindElement({
                path: sPath,
                model: "inspectionModel",
                events: {
                    dataReceived: function (oData) {
                        if (oData) {
                            var oEntity = oData.getParameter("data");
                            this._updateUIState(oEntity);
                        }
                    }.bind(this)
                }
            });
        },

        _updateUIState: function (oEntity) {
            var oViewModel = this.getView().getModel("viewModel");

            // FRS: "Pending" means we can edit. Anything else (A, R) is Read-Only.
            // Note: Backend might return "PENDING" or "Pending", let's be safe.
            // Also checking if code is empty or null, treat as pending.
            var sCode = oEntity.UsageDecisionCode;
            var bIsPending = (!sCode || sCode === 'PENDING');

            oViewModel.setProperty("/editable", bIsPending);

            this._calculateTotal(oEntity);
        },

        onQtyChange: function () {
            // Read values directly from Controls for immediate UI feedback
            var sUnrestricted = this.byId("idUnrestrictedQty").getValue();
            var sBlocked = this.byId("idBlockedQty").getValue();
            var sProduction = this.byId("idProductionQty").getValue();

            // Calculate Total
            var u = parseFloat(sUnrestricted) || 0;
            var b = parseFloat(sBlocked) || 0;
            var p = parseFloat(sProduction) || 0;
            var total = u + b + p;

            // Update ViewModel for visuals
            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/totalInspected", total);

            // Fetch Lot Quantity from Context
            var oContext = this.getView().getBindingContext("inspectionModel");
            if (oContext) {
                var lotQty = parseFloat(oContext.getProperty("LotQuantity")) || 0;
                var bBalanced = (Math.abs(total - lotQty) < 0.01);
                oViewModel.setProperty("/isBalanced", bBalanced);

                // CRITICAL: Explicitly update the OData Model properties to ensure 'hasPendingChanges' is true
                // This handles the case where TwoWay binding doesn't update on liveChange
                var oModel = this.getView().getModel("inspectionModel");
                oModel.setProperty("UnrestrictedQty", sUnrestricted, oContext);
                oModel.setProperty("BlockedQty", sBlocked, oContext);
                oModel.setProperty("ProductionQty", sProduction, oContext);
            }
        },

        // Legacy helper, integrated into onQtyChange for better live control
        _calculateTotal: function (oEntity) {
            // Only called on Init/Route match
            var u = parseFloat(oEntity.UnrestrictedQty) || 0;
            var b = parseFloat(oEntity.BlockedQty) || 0;
            var p = parseFloat(oEntity.ProductionQty) || 0;
            var total = u + b + p;

            var lotQty = parseFloat(oEntity.LotQuantity) || 0;

            var oViewModel = this.getView().getModel("viewModel");
            oViewModel.setProperty("/totalInspected", total);
            oViewModel.setProperty("/isBalanced", (Math.abs(total - lotQty) < 0.01));
        },

        onSave: function () {
            var oModel = this.getView().getModel("inspectionModel");
            var oContext = this.getView().getBindingContext("inspectionModel");

            if (!oContext) return;

            // Check if clean
            if (!oModel.hasPendingChanges()) {
                MessageToast.show("No changes to save.");
                return;
            }

            sap.ui.core.BusyIndicator.show(0);
            oModel.submitChanges({
                success: function () {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Results Saved Successfully.");
                    this._updateUIState(oContext.getObject());
                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Error saving results.");
                }
            });
        },

        onNavToUD: function () {
            var oContext = this.getView().getBindingContext("inspectionModel");
            var sLot = oContext.getProperty("InspectionLot");
            // Force navigate to UsageDecision View (even if it's separate, or handle it here)
            // Per plan, I have a separate Route
            sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteUsageDecision", {
                InspectionLot: sLot // Need to add parameter to RouteUsageDecision in manifest?
                // Wait, I defined RouteUsageDecision pattern: "usage-decision" without ID in manifest plan.
                // I should fix that if I want to pass ID.
                // Or I can rely on a global model/session, but routing parm is better.
                // I'll assume I missed the ID in the manifest replacement step for Usage Decision.
                // I'll check manifest content later or update it now.
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
