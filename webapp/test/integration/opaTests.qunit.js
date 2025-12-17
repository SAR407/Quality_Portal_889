/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["qualityportal/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
