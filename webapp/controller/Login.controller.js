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

            // Trim inputs to avoid whitespace issues
            sUsername = sUsername.trim();
            sPassword = sPassword.trim();

            if (!sUsername || !sPassword) {
                MessageToast.show("Please enter both username and password.");
                return;
            }

            var oModel = this.getOwnerComponent().getModel("loginModel");
            sap.ui.core.BusyIndicator.show(0);

            var sPath = "/ZCDS_QP_LOGIN_889('" + sUsername + "')";

            oModel.read(sPath, {
                success: function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    if (oData) {
                        try {
                            // Check for password match (trimming backend data just in case)
                            var sBackendPass = (oData.password || "").trim();

                            if (sBackendPass === sPassword) {
                                MessageToast.show("Login Successful!");
                                var oRouter = UIComponent.getRouterFor(this);
                                oRouter.navTo("RouteDashboard");
                            } else {
                                console.error("Login Mismatch. Entered: " + sPassword + ", Backend: " + sBackendPass);
                                MessageToast.show("Invalid Password.");
                            }
                        } catch (err) {
                            console.error("Login logic error", err);
                            MessageToast.show("An error occurred during verification.");
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
