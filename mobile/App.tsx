import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { supabase } from './lib/supabase';

interface Court {
  id: string;
  name: string;
  description: string;
  hourly_rate: number;
  is_active: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  registration_fee: number;
}

export default function App() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch courts
      const { data: courtsData, error: courtsError } = await supabase
        .from('courts')
        .select('*')
        .eq('is_active', true);

      if (courtsError) throw courtsError;
      setCourts(courtsData || []);

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('start_time', { ascending: true });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>PBC25 Pickleball Club</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Courts</Text>
          {courts.length === 0 ? (
            <Text style={styles.emptyText}>No courts available</Text>
          ) : (
            courts.map((court) => (
              <View key={court.id} style={styles.card}>
                <Text style={styles.cardTitle}>{court.name}</Text>
                <Text style={styles.cardDescription}>{court.description}</Text>
                <Text style={styles.cardPrice}>${court.hourly_rate}/hour</Text>
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>Book Court</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {events.length === 0 ? (
            <Text style={styles.emptyText}>No upcoming events</Text>
          ) : (
            events.map((event) => (
              <View key={event.id} style={styles.card}>
                <Text style={styles.cardTitle}>{event.title}</Text>
                <Text style={styles.cardDescription}>{event.description}</Text>
                <Text style={styles.cardDetail}>Type: {event.event_type}</Text>
                <Text style={styles.cardDetail}>
                  Date: {new Date(event.start_time).toLocaleDateString()}
                </Text>
                <Text style={styles.cardDetail}>
                  Time: {new Date(event.start_time).toLocaleTimeString()}
                </Text>
                {event.registration_fee > 0 && (
                  <Text style={styles.cardPrice}>Fee: ${event.registration_fee}</Text>
                )}
                <TouchableOpacity style={[styles.button, styles.registerButton]}>
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
