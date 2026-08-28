package com.automation.tests;

import com.automation.base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SampleApkTest extends BaseTest {

    @Test(description = "Verify that the Appium driver successfully connects and creates a session")
    public void testAppLaunchAndSession() {
        System.out.println("Executing: testAppLaunchAndSession");
        Assert.assertNotNull(driver.getSessionId(), "Appium driver session ID should not be null");
        System.out.println("Driver session active with ID: " + driver.getSessionId());
    }

    @Test(description = "Verify that UI page source and elements are queryable")
    public void testUIHierarchyInspection() {
        System.out.println("Executing: testUIHierarchyInspection");
        String pageSource = driver.getPageSource();
        Assert.assertNotNull(pageSource, "Page source XML should not be null");
        Assert.assertTrue(pageSource.length() > 0, "Page source XML should contain element hierarchy");
        System.out.println("Page source successfully extracted (" + pageSource.length() + " bytes)");
    }

    @Test(description = "Verify device properties and capabilities")
    public void testDeviceStateAndOrientation() {
        System.out.println("Executing: testDeviceStateAndOrientation");
        System.out.println("Device Orientation: " + driver.getOrientation());
        Assert.assertNotNull(driver.getOrientation(), "Device orientation should be returned");
    }
}
