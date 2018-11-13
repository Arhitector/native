/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  ListView,
  Text,
  View,
  Button
} from 'react-native';
import PushNotification from 'react-native-push-notification';
PushNotification.configure({
    onRegister: function(token) {
        console.log( 'TOKEN:', token );
    },
    onNotification: function(notification) {
        console.log( 'NOTIFICATION:', notification );
        notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
    senderID: "YOUR GCM (OR FCM) SENDER ID",  
    permissions: {
        alert: true,
        badge: true,
        sound: true
    },
    popInitialNotification: true,
    requestPermissions: true,
  });

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      coinData: ds.cloneWithRows([]),
      coinList: [],
      coinExpect: ['BTC','ETH'],
      diffLimit: 0,
    };
  }
  componentDidMount() {
    this._executeQuery()
    setInterval(this._executeQuery, 3000);
  }
  _executeQuery = () => {
    fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${this.state.coinExpect.join(',')}&tsyms=EUR`)
    .then( response => response.json())
    .then(response => {
      const coinData = Object.keys(response).map((coin) => {
        // alert(JSON.stringify(this.state.coinData._dataBlob.s1));
        const isCoin = (this.state.coinData._dataBlob.s1 || []).find(el => el.name === coin);
        const diff = isCoin ? isCoin.price - response[coin].EUR : 0;
        //alert(diff);
        // diff > diffLimit && PushNotification.localNotification({message: "My Notification Message"});
        PushNotification.localNotification({
          message: "My Notification Message",
        })
        return {
          key: coin,
          name: coin,
          price: response[coin].EUR,
          diff,
        }
      });
      
      this.setState({
        coinData: this.state.coinData.cloneWithRows(coinData),
        })
    }) 
  }

  _loadList = () => {
    fetch('https://www.cryptocompare.com/api/data/coinlist')
    .then( response => response.json())
    .then(response => {
      alert(response.Data);
      this.setState({
        coinList: Object.keys(response.Data).map(coin => ({
          key: response.Data[coin].Id,
          abbr: response.Data[coin].Name,
          name: response.Data[coin].CoinName,
        })),
      });
    })
  }
  render() {
    
    const {
      coinData
    } = this.state;
    // alert(JSON.stringify(this.state.coinData));
    return (
      <View style={styles.container}>
        <Text style={styles.title} >Coins dinamic</Text>
        <Text style={styles.instructions}>To get started, edit App.js</Text>
        <Text style={styles.instructions}>{instructions}</Text>
        <ListView
        dataSource={coinData}
        renderRow={(rowData) => <Text>{rowData.name}, {rowData.price} { rowData.diff !== 0 ? rowData.diff > 0 ? `up ${rowData.diff}` : `down ${rowData.diff}` : null }</Text>}
      />
        <Button
          onPress={this._loadList}
          title='Load Coins' />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
  },
  title: {
    fontSize: 40,
    textAlign: 'center'
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
