/**
 * @format
 */

import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";

// Code, um die gelben Fehlermeldungen zu disablen
console.disableYellowBox = true;

AppRegistry.registerComponent(appName, () => App);
