import TabIcon from "@/components/atoms/tabicon/tabicon";
import { tabs } from "@/constants/data";
import { Colors } from "@/constants/theme";
import { Tabs } from 'expo-router';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axiosInstance';

const fetchPointsData = async () => {
  const { data } = await axiosInstance.get('/api/mobile/v1/poin/balance');
  return data?.data || data;
};

const TabLayout = () => {
  const { data } = useQuery({
    queryKey: ['points'],
    queryFn: fetchPointsData,
    staleTime: 1000 * 60 * 5, // 5 minutes cache to prevent duplicate calls
  });

  const isShop = data?.clientType === 'SHOP';

  return (
    <Tabs
      initialRouteName="home"
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
          height: 80,
          paddingTop: 20,
          paddingInline: 20
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      {tabs.map((tab) => {
        // Hide 'poin' tab if not a SHOP
        const shouldHide = tab.name === 'poin' && !isShop;
        
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              animation: 'shift',
              href: shouldHide ? null : undefined,
              tabBarIcon: ({ focused }) => (
                <TabIcon
                  label={tab.title}
                  icon={tab.icon}
                  focused={focused}
                  size={22}
                />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
};

export default TabLayout;
