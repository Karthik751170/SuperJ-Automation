# 🚀 Cloud-Based Android APK Automation with Appium & Java (GitHub Actions)

This project provides a **100% Free, Cloud-Based Android Automation Pipeline** using **Java**, **TestNG**, **Appium 2.x**, and **GitHub Actions**.

No local emulators or heavy software are needed on your Mac. All Android emulators run in the cloud with zero CPU/RAM impact on your computer.

---

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       └── appium_android_test.yml   # Automated GitHub Actions Cloud Pipeline
├── apps/                             # Drop your .apk files here
│   └── README.txt
├── src/
│   └── test/
│       └── java/
│           └── com/
│               └── automation/
│                   ├── base/
│                   │   └── BaseTest.java        # Appium Driver lifecycle & failure screenshots
│                   └── tests/
│                       └── SampleApkTest.java   # TestNG Test Cases in Java
├── pom.xml                                      # Maven dependencies (Appium Java Client, TestNG)
├── testng.xml                                   # Test suite runner configuration
└── README.md
```

---

## 🛠️ How to Use

### 1. Add Your Android `.apk`
Copy your `.apk` file into the `apps/` directory:
```bash
cp /path/to/your/app.apk apps/
```
*Note: If no `.apk` is present, the test suite defaults to automating the built-in Android Settings app.*

---

### 2. Push Your Project to GitHub

Initialize git and push this repository to GitHub:

```bash
git init
git add .
git commit -m "Setup Appium Java Cloud Automation"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
git push -u origin main
```

---

### 3. Run Tests in the Cloud (GitHub Actions)

1. Open your repository on **GitHub.com**.
2. Click on the **Actions** tab at the top.
3. Select **"Appium Mobile Automation CI"** on the left.
4. Click **"Run workflow"** → Select branch `main` → Click the green **"Run workflow"** button.

---

### 4. View Test Reports & Failure Screenshots

Once the test run finishes:
1. Click on the completed workflow run.
2. Scroll down to the **Artifacts** section at the bottom.
3. Download:
   * **`testng-test-reports`**: Full HTML & XML execution reports.
   * **`failure-screenshots`**: Screenshots taken automatically if any test step failed.
   * **`appium-logs`**: Complete Appium driver logs.

---

## ✍️ Writing New Java Tests

Add your test classes under `src/test/java/com/automation/tests/`.

### Example Test Class:
```java
package com.automation.tests;

import com.automation.base.BaseTest;
import io.appium.java_client.AppiumBy;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

    @Test
    public void testUserLogin() {
        // Find elements by Accessibility ID, ID, or XPath
        WebElement username = driver.findElement(AppiumBy.accessibilityId("username_input"));
        WebElement password = driver.findElement(AppiumBy.accessibilityId("password_input"));
        WebElement loginBtn = driver.findElement(AppiumBy.id("com.example.app:id/login_button"));

        // Perform actions
        username.sendKeys("testuser");
        password.sendKeys("SecretPass123");
        loginBtn.click();

        // Assert expected result
        WebElement welcomeMsg = driver.findElement(AppiumBy.id("com.example.app:id/welcome_message"));
        Assert.assertEquals(welcomeMsg.getText(), "Welcome, testuser!");
    }
}
```
