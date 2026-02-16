import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

export const Button = ({ title, onPress }: { title: string, onPress: () => void }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
    },
    text: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
})
