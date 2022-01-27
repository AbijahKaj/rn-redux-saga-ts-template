import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  EmitterSubscription,
  Keyboard,
  Platform,
  StyleSheet,
  View,
} from 'react-native';

import { compose } from 'lodash/fp'

import Toast from 'react-native-simple-toast';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './login';
import { WithT, withTranslation } from 'app/utils/i18next';
import { clearNetworkFail } from 'app/reducers/network';

export type StackParamList = {
  LoginScreen: undefined;
};

const Stack = createNativeStackNavigator<StackParamList>();

interface Props {
  isLoggedIn: boolean;
}

interface State {
  isKeyboardShow: boolean;
  keyboardHeight: number;
  isShowNetworkErr: boolean;
}

const RootScreenComponent: React.FC<Props & WithT> = props => {
  let keyboardDidShowListener!: EmitterSubscription;
  let keyboardDidHideListener!: EmitterSubscription;
  const [state, setState] = useState({
    isKeyboardShow: false,
    keyboardHeight: 0,
    isShowNetworkErr: false,
  });

  useEffect(() => {
    componentDidMount();
  }, []);
  useEffect(() => {
    return () => {
      componentWillUnmount();
    };
  }, []);

  function componentDidMount() {
    keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      keyboardDidShow,
    );
    keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      keyboardDidHide,
    );
  }
  useEffect(() => {
    getDerivedStateFromProps(props);
  }, [props]);
  function componentWillUnmount() {
    keyboardDidShowListener.remove();
    keyboardDidHideListener.remove();
  }
  const keyboardDidShow = (e: any) => {
    setState({
      ...state,
      isKeyboardShow: true,
      keyboardHeight: e.endCoordinates.height,
    });
  };

  const keyboardDidHide = () => {
    setState({ ...state, isKeyboardShow: false });
  };

  function getDerivedStateFromProps(nextProps: any) {
    if (nextProps.sendNetworkFail.err) {
      switch (nextProps.sendNetworkFail.err) {
        case 'NETWORK_ERROR':
          Toast.show('No network connection, please try again');
          break;
        case 'TIMEOUT_ERROR':
          Toast.show('Timeout, please try again');
          break;
        case 'CONNECTION_ERROR':
          Toast.show('DNS server not found, please try again');
          break;
        default:
          Toast.show(nextProps.sendNetworkFail.err);
          break;
      }
      nextProps.onCallApi(clearNetworkFail());
    }

    return null;
  }

  return (
    <View style={styles.mainContainer}>
      <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator headerMode={'none'}>
          {!props.isLoggedIn ? (
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
          ) : (
            <>
              
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      {state.isKeyboardShow && Platform.OS === 'ios' ? (
        <View style={{ height: state.keyboardHeight }} />
      ) : null}
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => {
  return {
    sendNetworkFail: state.network,
    isLoggedIn: state.auth.isLoggedIn,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    onCallApi: (object: object) => dispatch(object),
  };
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});

export const RootScreen = compose(
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps),
  React.memo,
)(RootScreenComponent)