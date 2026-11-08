import React from 'react';
import { MonitoringRoot, reportStartupError } from './src/monitoring/observe';
import { View, ScrollView, Text, Pressable, StyleSheet } from 'react-native';

function FailureScreen({ error }) {
  const [details, setDetails] = React.useState(false);
  React.useEffect(() => { reportStartupError(error); }, [error]);
  return <View style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>HeatItUp</Text>
      <Text style={styles.text}>A játék indítása nem sikerült. / The app could not start. / Die App konnte nicht gestartet werden.</Text>
      <Text style={styles.text}>A mentett adataidat nem töröltük. / Your saved data has not been deleted.</Text>
      <Pressable accessibilityRole="button" onPress={() => setDetails(value => !value)} style={styles.button}>
        <Text style={styles.text}>Hiba részletei / Error details</Text>
      </Pressable>
      {details && <Text selectable style={styles.details}>{String(error?.stack || error?.message || error).slice(0, 8000)}</Text>}
    </ScrollView>
  </View>;
}

class StartupBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    return this.state.error ? <FailureScreen error={this.state.error} /> : this.props.children;
  }
}

const loadApplication = () => require('./App').default;

function StartupContent({ loadApp }) {
  let Application;
  try {
    Application = loadApp();
  } catch (error) {
    return <FailureScreen error={error} />;
  }
  return <StartupBoundary><Application /></StartupBoundary>;
}

export default function Startup({ loadApp = loadApplication }) {
  return <MonitoringRoot><StartupContent loadApp={loadApp} /></MonitoringRoot>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#130D18' },
  content: { padding: 24, gap: 24, flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 32, color: '#FFF7FA', fontWeight: '700' },
  text: { fontSize: 17, color: '#FFF7FA', lineHeight: 25 },
  button: { minHeight: 48, justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: '#FF7A90', borderRadius: 12 },
  details: { color: '#FFF7FA', fontSize: 13, lineHeight: 20 }
});
