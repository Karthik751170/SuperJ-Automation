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
        options.setNoReset(true);
        options.setNewCommandTimeout(Duration.ofSeconds(120));
        options.setAdbExecTimeout(Duration.ofSeconds(120));
        options.setUiautomator2ServerInstallTimeout(Duration.ofSeconds(120));

        // Check if an APK file is present in apps/ directory
        String appPath = System.getProperty("app.path");
        if (appPath == null || appPath.isEmpty()) {
            File appsDir = new File("apps");
            if (appsDir.exists() && appsDir.isDirectory()) {
                File[] apkFiles = appsDir.listFiles((dir, name) -> name.toLowerCase().endsWith(".apk"));
                if (apkFiles != null && apkFiles.length > 0) {
                    appPath = apkFiles[0].getAbsolutePath();
                }
            }
        }

        if (appPath != null && new File(appPath).exists()) {
            System.out.println("Installing and launching custom APK: " + appPath);
            options.setApp(appPath);
        } else {
            System.out.println("No custom APK found in apps/ directory. Testing Android Settings app.");
            options.setAppPackage("com.android.settings");
            // Do not hardcode appActivity; let UiAutomator2 resolve the default launch intent
        }

        // Appium Server URL
        String appiumUrl = System.getProperty("appium.url", "http://127.0.0.1:4723");
        URL serverUrl = URI.create(appiumUrl).toURL();

        System.out.println("Connecting to Appium at: " + serverUrl);
        driver = new AndroidDriver(serverUrl, options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(15));
    }

    @AfterMethod
    public void tearDown(ITestResult result) {
        if (driver != null) {
            if (result.getStatus() == ITestResult.FAILURE) {
                captureScreenshot(result.getName());
            }
            try {
                driver.quit();
            } catch (Exception e) {
                System.out.println("Driver quit info: " + e.getMessage());
            }
            System.out.println("Driver session closed successfully.");
        }
    }

    public void captureScreenshot(String testName) {
        try {
            File srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
            File destDir = new File("target/screenshots");
            if (!destDir.exists()) destDir.mkdirs();
            File destFile = Paths.get("target", "screenshots", testName + "_" + timestamp + ".png").toFile();
            FileUtils.copyFile(srcFile, destFile);
            System.out.println("Screenshot captured: " + destFile.getAbsolutePath());
        } catch (IOException e) {
            System.err.println("Failed to capture screenshot: " + e.getMessage());
        }
    }
}
