1 npm install
2 cd ios
   pod install
3 cd ..
4 ./gradlew clean
5 npx react-native run-android (make sure connect android device wifi or usb    or start android emulator from android studio)
6 npx react-native run-ios (make sure connect ios device wifi or usb or start ios simulator from xcode)

7 cd android
8 ./gradlew assembleRelease (for release build or apk in staging mode)
9 ./gradlew bundleRelease (for release build or apk in production mode)
10 also change ngrok url in api.config.js for GRAPHQL_ENDPOINT and IMAGE_BASE_URL