import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, FlatList, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GoBackBtn from '../../components/GoBackBtn';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const ACTIVITIES = [
  { id: 'phonics', name: 'Phonics', icon: '🗣️', color: '#FF9800' },
  { id: 'writing', name: 'Writing', icon: '✍️', color: '#4CAF50' },
  { id: 'reading', name: 'Reading', icon: '📖', color: '#2196F3' },
];

export default function AdminAssignActivitiesScreen({ navigation }) {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledStudents();
  }, []);

  const fetchEnrolledStudents = async () => {
    const { data } = await supabase
      .from('enrollments')
      .select('*, profiles!enrollments_student_id_fkey(id, full_name, email, xp)')
      .eq('teacher_id', profile?.id);
    
    if (data) {
      setStudents(data);
      if (data.length > 0) {
        selectStudent(data[0]);
      }
    }
    setLoading(false);
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    
    // Fetch current assignments for this student
    const { data } = await supabase
      .from('assignments')
      .select('activity_type')
      .eq('student_id', student.profiles.id);
    
    const assignmentMap = {};
    ACTIVITIES.forEach(activity => {
      assignmentMap[activity.id] = data?.some(a => a.activity_type === activity.id) || false;
    });
    setAssignments(assignmentMap);
  };

  const toggleAssignment = async (activityId) => {
    if (!selectedStudent) return;

    const isAssigned = assignments[activityId];
    
    if (isAssigned) {
      // Remove assignment
      await supabase
        .from('assignments')
        .delete()
        .eq('student_id', selectedStudent.profiles.id)
        .eq('activity_type', activityId)
        .eq('teacher_id', profile?.id);
    } else {
      // Add assignment
      await supabase
        .from('assignments')
        .insert({
          teacher_id: profile?.id,
          student_id: selectedStudent.profiles.id,
          activity_type: activityId,
        });
    }

    setAssignments(prev => ({
      ...prev,
      [activityId]: !isAssigned
    }));
  };

  const StudentItem = ({ item, isSelected, onPress }) => (
    <TouchableOpacity 
      style={[styles.studentItem, isSelected && styles.studentItemActive]}
      onPress={onPress}
    >
      <View style={styles.studentInfo}>
        <Text style={[styles.studentName, isSelected && styles.studentNameActive]}>
          {item.profiles?.full_name}
        </Text>
        <Text style={styles.studentEmail}>{item.profiles?.email}</Text>
      </View>
      <Text style={[styles.studentXP, isSelected && styles.studentXPActive]}>
        {item.profiles?.xp || 0} XP
      </Text>
    </TouchableOpacity>
  );

  const ActivityItem = ({ activity }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIconBox, { backgroundColor: activity.color }]}>
        <Text style={styles.activityIcon}>{activity.icon}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityName}>{activity.name}</Text>
        <Text style={styles.activityDesc}>Assign to student</Text>
      </View>
      <Switch
        value={assignments[activity.id] || false}
        onValueChange={() => toggleAssignment(activity.id)}
        trackColor={{ false: '#ccc', true: '#81C784' }}
        thumbColor={assignments[activity.id] ? '#4CAF50' : '#999'}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (students.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#4c669f', '#3b5998']} style={styles.header}>
          <GoBackBtn />
          <Text style={styles.headerTitle}>Assign Activities</Text>
        </LinearGradient>
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Ionicons name="people" size={80} color="#ccc" style={{ marginBottom: 20 }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#666', textAlign: 'center' }}>
            No students enrolled yet
          </Text>
          <Text style={{ fontSize: 14, color: '#999', marginTop: 10, textAlign: 'center' }}>
            Once students enroll, you can assign them activities here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={['#4c669f', '#3b5998']} style={styles.header}>
        <GoBackBtn />
        <Text style={styles.headerTitle}>Assign Activities</Text>
        <Text style={styles.headerSub}>Select a student and enable activities</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Select Student</Text>
        
        <FlatList
          data={students}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <StudentItem 
              item={item} 
              isSelected={selectedStudent?.id === item.id}
              onPress={() => selectStudent(item)}
            />
          )}
          scrollEnabled={false}
        />

        {selectedStudent && (
          <>
            <Text style={styles.sectionLabel}>Activities for {selectedStudent.profiles?.full_name}</Text>
            
            <View style={styles.activitiesContainer}>
              {ACTIVITIES.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, paddingRight: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 5 },
  
  scrollContent: { padding: 20 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 15, marginTop: 15 },
  
  studentItem: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: 'transparent' },
  studentItemActive: { backgroundColor: '#E8F5E9', borderLeftColor: '#4CAF50' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  studentNameActive: { color: '#2E7D32' },
  studentEmail: { fontSize: 12, color: '#999', marginTop: 3 },
  studentXP: { fontSize: 14, fontWeight: 'bold', color: '#FFD700' },
  studentXPActive: { color: '#F57C00' },
  
  activitiesContainer: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginTop: 10 },
  activityItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  activityIconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  activityIcon: { fontSize: 28 },
  activityContent: { flex: 1 },
  activityName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  activityDesc: { fontSize: 12, color: '#999', marginTop: 2 },
});
