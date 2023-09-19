import React, {FC} from 'react';
import {StyleSheet, View} from 'react-native';

interface Props {}

const Home: FC<Props> = props => {
  return <View style={styles.container}>$</View>;
};

const styles = StyleSheet.create({
  container: {},
});

export default Home;
