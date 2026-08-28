package com.automation.tests;

import com.automation.base.BaseTest;
import io.appium.java_client.AppiumBy;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class SampleApkTest extends BaseTest {

    @Test(description = "Verify that the Appium driver successfully connects and creates a session")
    public void testAppLaunchAndSession() {
        System.out.println("Executing: testAppLaunchAndSession");
        Assert.assertNotNull(driver.getSessionId(), "Appium driver session ID should not be null");
        
        String currentPackage = driver.getCurrentPackage();
        System.out.println("Active Package: " + currentPackage);
        Assert.assertNotNull(currentPackage, "Current package should not be null");
    }

    @Test(description = "Verify that UI elements are detected on screen")
    public void testUIElementsDetection() {
        System.out.println("Executing: testUIElementsDetection");
        List<WebElement> elements = driver.findElements(AppiumBy.xpath("//*"));
        System.out.println("Detected total elements on screen: " + elements.size());
        Assert.assertTrue(elements.size() > 0, "There should be elements present on screen");
    }

    @Test(description = "Verify device properties and capabilities")
    public void testDeviceProperties() {
        System.out.println("Executing: testDeviceProperties");
        System.out.println("Device Orientation: " + driver.getOrientation());
        Assert.assertNotNull(driver.getOrientation(), "Device orientation should be returned");
    }
}
