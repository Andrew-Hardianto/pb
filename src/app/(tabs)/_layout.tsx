import TabIcon from "@/components/atoms/tabicon/tabicon";
import { tabs } from "@/constants/data";
import { Colors } from "@/constants/theme";
import { Tabs } from 'expo-router';
import React from 'react';

const TabLayout = () => {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.danger,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: Colors.primary,
          borderTopWidth: 0,
          borderTopEndRadius: 16,
          borderTopStartRadius: 16,
          elevation: 0,
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 80,
          paddingTop: 20,
          paddingInline: 20
        },
        tabBarIconStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            animation: 'shift',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon
                label={tab.title}
                icon={tab.icon}
                focused={focused}
                size={22}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
