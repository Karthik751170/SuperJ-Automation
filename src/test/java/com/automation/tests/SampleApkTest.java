package com.automation.tests;

import com.automation.base.BaseTest;
import io.appium.java_client.AppiumBy;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class SampleApkTest extends BaseTest {

    @Test(description = "Verify that the app launches successfully")
    public void testAppLaunch() {
        System.out.println("Starting test: testAppLaunch");
        
        // Assert that the driver is active and session exists
        Assert.assertNotNull(driver.getSessionId(), "Appium driver session should not be null");
        
        // Get current package or activity
        String currentPackage = driver.getCurrentPackage();
        System.out.println("Current active package: " + currentPackage);
        Assert.assertNotNull(currentPackage, "Active package should be detected");
    }

    @Test(description = "Verify UI elements are present on screen")
    public void testUIElementsPresent() {
        System.out.println("Starting test: testUIElementsPresent");

        // Find elements displayed on screen (generic search)
        List<WebElement> elements = driver.findElements(AppiumBy.xpath("//*[@clickable='true']"));
        System.out.println("Found " + elements.size() + " clickable elements on screen.");

        Assert.assertTrue(elements.size() > 0, "There should be at least one interactive UI element on screen");
    }

    @Test(description = "Example of interacting with an element (scroll / click)")
    public void testElementInteraction() {
        System.out.println("Starting test: testElementInteraction");

        // Look for any standard text or button element
        List<WebElement> textViews = driver.findElements(AppiumBy.className("android.widget.TextView"));
        if (!textViews.isEmpty()) {
            WebElement firstText = textViews.get(0);
            System.out.println("First TextView content: " + firstText.getText());
            Assert.assertNotNull(firstText.getText());
        }
    }
}
