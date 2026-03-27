import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [wallet, setWallet] = useState({
    yellow_balance: 0,
    green_balance: 0,
    red_balance: 0
  });

  useEffect(() => {
    // In a real app, this fetches from FastAPI: fetch('http://localhost:8000/api/users/PR001/wallet')
    // We simulate a loaded state for the UI build phase
    setWallet({
      yellow_balance: 15.5,
      green_balance: 5.0,
      red_balance: 2.0
    });
  }, []);

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 pt-10">
      <Text className="text-3xl font-bold text-gray-900 mb-6">SustainX Wallet</Text>
      
      <View className="bg-white rounded-2xl p-6 shadow-sm mb-4 border border-gray-100">
        <Text className="text-gray-500 font-medium mb-1">Yellow Coins</Text>
        <Text className="text-4xl font-bold text-yellow-500">{wallet.yellow_balance}</Text>
        <Text className="text-xs text-gray-400 mt-2">Owner-generated solar energy</Text>
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-sm mb-4 border border-gray-100">
        <Text className="text-gray-500 font-medium mb-1">Green Coins</Text>
        <Text className="text-4xl font-bold text-green-500">{wallet.green_balance}</Text>
        <Text className="text-xs text-gray-400 mt-2">System-available solar origin</Text>
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-gray-100">
        <Text className="text-gray-500 font-medium mb-1">Red Coins</Text>
        <Text className="text-4xl font-bold text-red-500">{wallet.red_balance}</Text>
        <Text className="text-xs text-gray-400 mt-2">Conventional consumption liability</Text>
      </View>

      <TouchableOpacity className="bg-black py-4 rounded-xl items-center mb-10">
        <Text className="text-white font-semibold text-lg">Initiate Transfer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
