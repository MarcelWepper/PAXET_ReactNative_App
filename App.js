// create our app's navigation stack
import React from "react";
import {
  StyleSheet,
  Platform,
  Image,
  Text,
  View,
  StatusBar
} from "react-native";
import {
  createSwitchNavigator,
  createAppContainer,
  createDrawerNavigator,
  DrawerItems
} from "react-navigation";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { connect } from "react-redux";
import Icon from "react-native-vector-icons/FontAwesome5";
import Icon2 from "./components/pictures/BrandNew.png";

import { Container, Header, Right, Left, Body, Content } from "native-base";
import paxet from "./components/PAXET";

// import the different screens
import Loading from "./components/Loading";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Main from "./components/Main";
import User from "./components/User";
import Picture from "./components/Picture";
import Profile from "./components/Profile";
import Mail from "./components/Mail";
import PackageScreen from "./components/PackageScreen";
import FAQ from "./components/FAQ";
import Role from "./components/Role";

//Link für das anzeigen des Bilders im SideNav
this.state = {
  stateurlProfile:
    "https://firebasestorage.googleapis.com/v0/b/paxet-app.appspot.com/o/bilder%2Fdefault%2FLogo.jpg?alt=media&token=f13b09a5-0df3-40f9-967b-2ac34925a12c"
};

const store = createStore(paxet);

// create our app's navigation stack

const CustomDrawerContentComponent = props => (
  <Container>
    <Header style={{ height: 75, backgroundColor: "#9b0029" }}>
      <Body>
        <Image
          style={{
            height: 50,
            width: 50,
            borderRadius: 15,
            alignSelf: "center",
            justifyContent: "center",
            paddingBottom: 5
          }}
          source={Icon2}
        />
      </Body>
    </Header>
    <Content>
      <DrawerItems {...props} />
    </Content>
  </Container>
);

let HubNavigator = createDrawerNavigator(
  {
    Profil: {
      screen: Profile,
      navigationOptions: {
        drawerIcon: () => <Icon name="user-circle" size={22.5} />
      }
    },
    Pakete: {
      screen: User,
      navigationOptions: {
        drawerIcon: () => <Icon name="box" size={22.5} />
      }
    },
    Karte: {
      screen: Main,
      navigationOptions: {
        drawerIcon: () => <Icon name="globe-europe" size={22.5} />
      }
    },
    FAQ: {
      screen: FAQ,
      navigationOptions: {
        drawerIcon: () => <Icon name="question-circle" size={22.5} />
      }
    }
  },
  {
    initialRouteName: "Karte",
    drawerType: "slide",
    drawerBackgroundColor: "#9b0029",
    contentComponent: CustomDrawerContentComponent
    // drawerPosition: 'right',
    // drawerWidth: 200,
  }
);

let DeliveryNavigator = createDrawerNavigator(
  {
    Profil: {
      screen: Profile,
      navigationOptions: {
        drawerIcon: () => <Icon name="user-circle" size={22.5} />
      }
    },
    Karte: {
      screen: Main,
      navigationOptions: {
        drawerIcon: () => <Icon name="globe-europe" size={22.5} />
      }
    }
  },
  {
    initialRouteName: "Karte",
    drawerType: "slide",
    drawerBackgroundColor: "#9b0029",
    contentComponent: CustomDrawerContentComponent
    // drawerPosition: 'right',
    // drawerWidth: 200,
  }
);

let AppSwitchNavigator = createSwitchNavigator(
  {
    Loading: { screen: Loading },
    SignUp: { screen: SignUp },
    Login: { screen: Login },
    Role: { screen: Role },
    Main: { screen: HubNavigator },
    Delivery: { screen: DeliveryNavigator },
    Mail: { screen: Mail },
    FAQ: { screen: FAQ },
    PackageScreen: {
      screen: PackageScreen
    }
  },
  {
    initialRouteName: "Loading"
  }
);

let Navigation = createAppContainer(AppSwitchNavigator);

// Render the app container component with the provider around it
class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        {Platform.OS === "android" && <StatusBar hidden={true} />}

        <Navigation />
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  statusbar: {}
});

export default App;
