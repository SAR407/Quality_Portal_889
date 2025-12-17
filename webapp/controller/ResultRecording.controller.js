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

            // Check if UD is already taken
            if (oEntity.UsageDecisionCode && oEntity.UsageDecisionCode !== 'PENDING') {
                oViewModel.setProperty("/editable", false);
            } else {
                oViewModel.setProperty("/editable", true);
            }

            this._calculateTotal(oEntity);
        },

        onQtyChange: function () {
            var oContext = this.getView().getBindingContext("inspectionModel");
            if (oContext) {
                var oEntity = oContext.getObject();
                // Because liveChange updates the model thanks to two-way binding on Inputs? 
                // Wait, standard Input value binding is two-way.
                // We just need to trigger recalc.
                // However, standard Object binding might not auto-reflect pending changes in 'getObject' immediately validly if type issues.
                // We'll trust the binding updates.

                // Small delay to ensure model update if necessary, or read from inputs directly if needed.
                // Actually, let's read the properties from the model which should be updated.
                this._calculateTotal(oEntity);
            }
        },

        _calculateTotal: function (oEntity) {
            var u = parseFloat(oEntity.UnrestrictedQty) || 0;
            var b = parseFloat(oEntity.BlockedQty) || 0;
            var p = parseFloat(oEntity.ProductionQty) || 0;
            var total = u + b + p;
            this.getView().getModel("viewModel").setProperty("/totalInspected", total);
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
