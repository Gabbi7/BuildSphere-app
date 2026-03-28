import { useState } from "react";
import { Alert, StyleSheet, Text, View } from 'react-native';
import React from 'react';

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Text className="text-cyan-500 text-2xl font-bold">Welcome to the Login Page!</Text>
      <Text className="text-gray-500 text-base">
        Please enter your credentials to log in to your account.
      </Text>
    </View>
  )
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  }
})