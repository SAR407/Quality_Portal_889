sap.ui.define([], function () {
    "use strict";
    return {
        statusState: function (sStatus) {
            switch (sStatus) {
                case "A": return "Success"; // Approved -> Green
                case "R": return "Error";   // Rejected -> Red
                case "PENDING": return "Warning"; // Pending -> Yellow
                default: return "None";
            }
        },
        statusText: function (sStatus) {
            switch (sStatus) {
                case "A": return "Approved";
                case "R": return "Rejected";
                case "PENDING": return "Pending";
                default: return sStatus;
            }
        }
    };
});
