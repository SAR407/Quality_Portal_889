sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent"
], function (Controller, MessageToast, UIComponent) {
    "use strict";

    return Controller.extend("qualityportal.controller.Login", {
        onInit: function () {
        },

        onLogin: function () {
            var sUsername = this.byId("usernameInput").getValue();
            var sPassword = this.byId("passwordInput").getValue();

            if (!sUsername || !sPassword) {
                MessageToast.show("Please enter both username and password.");
                return;
            }

            var oModel = this.getOwnerComponent().getModel("loginModel");
            // Busy Indicator
            sap.ui.core.BusyIndicator.show(0);

            // Read path: /ZCDS_QP_LOGIN_889(Username='...')
            var sPath = "/ZCDS_QP_LOGIN_889('" + sUsername + "')";

            oModel.read(sPath, {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    if (oData) {
                        // Validate Password (as per requirement to use returned fields)
                        if (oData.Password === sPassword) {
                            MessageToast.show("Login Successful!");
                            // Navigate to Dashboard
                            var oRouter = UIComponent.getRouterFor(this);
                            oRouter.navTo("RouteDashboard");
                        } else {
                            MessageToast.show("Invalid Password.");
                        }
                    } else {
                        MessageToast.show("User not found.");
                    }
                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    try {
                        var oResponse = JSON.parse(oError.responseText);
                        MessageToast.show(oResponse.error.message.value);
                    } catch (e) {
                        MessageToast.show("Login Failed. Please check network or credentials.");
                    }
                }
            });
        }
    });
});
