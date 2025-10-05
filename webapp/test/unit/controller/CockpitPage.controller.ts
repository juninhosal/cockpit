/*global QUnit*/
import Controller from "com/alfa/cockpit/controller/Cockpit.controller";

QUnit.module("Cockpit Controller");

QUnit.test("I should test the Cockpit controller", function (assert: Assert) {
	const oAppController = new Controller("Cockpit");
	oAppController.onInit();
	assert.ok(oAppController);
});