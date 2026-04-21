import { tabs } from "@/constants/data";
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';

interface TabIconProps {
  icon: any;
  focused: boolean;
  color: string;
  size: number;
}

const TabIcon = ({ icon: Icon, focused, size = 24 }: TabIconProps) => {
  const isSvgComponent = typeof Icon === "function";

  return (
    <View>
      {isSvgComponent ? (
        <Icon width={size} height={size} />
      ) : (
        <Image
          source={Icon}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

const TabLayout = () => {
  // const { isSignedIn, isLoaded } = useAuth();

  // Wait for auth to load before rendering anything
  // if (!isLoaded) {
  //   return null;
  // }

  // Redirect to sign-in if user is not authenticated
  // if (!isSignedIn) {
  //   return <Redirect href="/(auth)/login" />;
  // }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          // bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          // height: tabBar.height,
          // marginHorizontal: tabBar.horizontalInset,
          // borderRadius: tabBar.radius,
          backgroundColor: "#F1F1",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          // paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6
        },
        tabBarIconStyle: {
          // width: tabBar.iconFrame,
          // height: tabBar.iconFrame,
          alignItems: 'center'
        }
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} color={""} size={0} />
            )
          }} />
      ))}
    </Tabs>
  )
}

export default TabLayout;
