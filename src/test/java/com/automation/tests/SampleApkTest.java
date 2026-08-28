package com.automation.tests;

import com.automation.base.BaseTest;
import io.appium.java_client.AppiumBy;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class SampleApkTest extends BaseTest {

    @Test(description = "Verify that the APK launches and an active Appium session is created")
    public void testAppLaunchAndSession() {
        System.out.println("Executing: testAppLaunchAndSession");
        Assert.assertNotNull(driver.getSessionId(), "Appium driver session ID should not be null");
        System.out.println("Active Session ID: " + driver.getSessionId());
    }

    @Test(description = "Verify UI elements are present and interactable on screen")
    public void testUIElementsPresent() {
        System.out.println("Executing: testUIElementsPresent");
        List<WebElement> elements = driver.findElements(AppiumBy.xpath("//*[@clickable='true' or @text!='']"));
        System.out.println("Found " + elements.size() + " visible/clickable elements on screen.");
        Assert.assertTrue(elements.size() > 0, "There should be elements present on screen");
    }

    @Test(description = "Verify UI page source hierarchy and layout extraction")
    public void testExtractUIHierarchy() {
        System.out.println("Executing: testExtractUIHierarchy");
        String pageSource = driver.getPageSource();
        Assert.assertNotNull(pageSource, "Page source XML should not be null");
        Assert.assertTrue(pageSource.length() > 50, "Page source XML should contain layout hierarchy");
        System.out.println("Page source successfully extracted (" + pageSource.length() + " bytes)");
    }
}
