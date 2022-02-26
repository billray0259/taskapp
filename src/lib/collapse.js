import React from 'react';
import { useState, useRef } from 'react';

import { Text, View, Animated, Icon, TouchableOpacity } from 'react-native';

import styles from '../styles';

// https://stackoverflow.com/questions/67060475/react-native-animated-accordion-drawer-drop-down-collapsible-card
export function Collapse({ title, children, style }) {
    const [isCollapsed, setCollapsed] = useState(true);
    const toggleCollapse = () => setCollapsed(!isCollapsed);


    return (
        <View style={[{...style}]}>
            <TouchableOpacity onPress={toggleCollapse}>
                {title}
            </TouchableOpacity>
            <Animated.View style={{ height: isCollapsed ? 0 : "auto" }}>
                {children}
            </Animated.View>
        </View>
    );
}