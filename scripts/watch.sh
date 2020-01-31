#!/bin/bash

# Super simple. Just start gulp. This will monitor for any changes to the following:
# - /src/webroot/scss/*.scss (sass) -> Compiles them into .css files in /src/webroot/css/
# - /src/webroot/scss/*.css (minify-css) -> Minifies CSS content into one line and saves it back in /src/webroot/css/
# - /src/webroot/**/ (browser-sync) -> Automatically keeps browser up to date with latest UI changes.
gulp