import React from 'react';
import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';

export function LeafletMap() {
  const testHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          html, body { width: 100%; height: 100%; margin: 0; padding: 0; }
          body { background: green; display: flex; align-items: center; justify-content: center; }
          h1 { color: white; font-family: sans-serif; }
        </style>
      </head>
      <body>
        <h1>Hola desde WebView ✅</h1>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: testHTML }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  webview: {
    flex: 1,
  },
});
