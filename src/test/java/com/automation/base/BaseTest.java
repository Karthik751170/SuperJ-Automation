package com.automation.base;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.Date;

public class BaseTest {

    protected AndroidDriver driver;

    @BeforeMethod
    public void setUp() throws Exception {
        UiAutomator2Options options = new UiAutomator2Options();
        options.setPlatformName("Android");
        options.setAutomationName("UiAutomator2");
        options.setDeviceName(System.getProperty("device.name", "Android Emulator"));
        options.setAutoGrantPermissions(true);
        options.setNewCommandTimeout(Duration.ofSeconds(60));

        // Check if an APK file path is supplied via System Property or environment variable
        String appPath = System.getProperty("app.path");
        if (appPath == null || appPath.isEmpty()) {
            // Check default apps/ directory
            File appsDir = new File("apps");
            if (appsDir.exists() && appsDir.isDirectory()) {
                File[] apkFiles = appsDir.listFiles((dir, name) -> name.toLowerCase().endsWith(".apk"));
                if (apkFiles != null && apkFiles.length > 0) {
                    appPath = apkFiles[0].getAbsolutePath();
                }
            }
        }

        if (appPath != null && new File(appPath).exists()) {
            System.out.println("Installing and launching APK: " + appPath);
            options.setApp(appPath);
        } else {
            // Default to Android Settings app for test baseline if no custom APK is placed yet
            System.out.println("No APK found in apps/ folder, launching Android Settings app as baseline.");
            options.setAppPackage("com.android.settings");
            options.setAppActivity(".Settings");
        }

        // Appium Server URL (GitHub Actions or local)
        String appiumUrl = System.getProperty("appium.url", "http://127.0.0.1:4723");
        URL serverUrl = URI.create(appiumUrl).toURL();

        System.out.println("Connecting to Appium Server at: " + serverUrl);
        driver = new AndroidDriver(serverUrl, options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
    }

    @AfterMethod
    public void tearDown(ITestResult result) {
        if (driver != null) {
            // Capture screenshot if test failed
            if (result.getStatus() == ITestResult.FAILURE) {
                captureScreenshot(result.getName());
            }
            driver.quit();
            System.out.println("Driver session closed.");
        }
    }

    public void captureScreenshot(String testName) {
        try {
            File srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            File destFile = Paths.get("target", "screenshots", testName + "_" + timestamp + ".png").toFile();
            FileUtils.copyFile(srcFile, destFile);
            System.out.println("Screenshot captured on failure: " + destFile.getAbsolutePath());
        } catch (IOException e) {
            System.err.println("Failed to capture screenshot: " + e.getMessage());
        }
    }
}
