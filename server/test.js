var assert = require('assert');
var webdriver = require('selenium-webdriver');
var test = require('selenium-webdriver/testing');
var remote = require('selenium-webdriver/remote');
var config = require("./config.js");
var By = webdriver.By;

test.describe('Virtual Arduino', function () {
    var driver;

    test.beforeEach(function () {
        driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
        var url = "http://" + config.web.hostname + ":" + config.web.port;
        driver.get(url);
    });

    test.it('should have the title: ' + config.web.title, function () {
        driver.getTitle().then(function(title) {
            assert.equal(title, config.web.title);
        });
    });

    test.it('can compile blink', function() {
        driver.findElement(By.id("compile")).click();
        driver.wait(function(){
            return driver.isElementPresent(By.className("program_counter"));
        }, 10000);
        driver.findElement(By.css(".program_counter + pre")).then(function(pre) {
            pre.getText().then(function(text) {
                assert.equal(text, "  Serial.begin(9600);");
            });
        });
    });

    test.afterEach(function () {
        driver.quit();
    });
});
