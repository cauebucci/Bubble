import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

export default function RootLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#7db2ff",
          tabBarInactiveTintColor: "#ffffff",
          tabBarStyle: {
            backgroundColor: "#6a0dad",
            borderTopWidth: 0,
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        {/* Mensagens */}
        <Tabs.Screen
          name="home/messages"
          options={{
            title: "",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
          }}
        />
        
        {/* Amigos */}
        <Tabs.Screen
          name="home/friends"
          options={{
            title: "",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        
        {/* Home - Botão Central B */}
        <Tabs.Screen
          name="home/index"
          options={{
            title: "",
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 27.5,
                  backgroundColor: focused ? "#7db2ff" : "#6a0dad",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: -25,
                  borderWidth: 3,
                  borderColor: "#6a0dad",
                  elevation: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 28,
                    fontWeight: "bold",
                    fontFamily: "CherryBombOne-Regular",
                  }}
                >
                  B
                </Text>
              </View>
            ),
          }}
        />
        
        {/* Notificações */}
        <Tabs.Screen
          name="home/notifications"
          options={{
            title: "",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications" size={size} color={color} />
            ),
          }}
        />
        
        {/* Menu/Atividades */}
        <Tabs.Screen
          name="home/activity"
          options={{
            title: "",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid" size={size} color={color} />
            ),
          }}
        />
        
        {/* Esconder rotas que não devem aparecer no menu */}
        <Tabs.Screen
          name="home"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="home/status"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="home/events"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}
